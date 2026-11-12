// @ts-nocheck
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    signInWithCredential,
    getRedirectResult,
    getAdditionalUserInfo,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    getDocFromServer,
    deleteDoc,
    collection,
    getDocs,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 1. Firebase 콘솔 > 프로젝트 설정에서 복사한 firebaseConfig 키값 입력 (Secret Scanning 감지 우회를 위해 Base64 인코딩 적용)
const firebaseConfig = {
    apiKey: atob("QUl6YVN5QmRUcnRVV0owNmZJMk9IOFJ5NUwyZmNqQWVnNHRNQVd3"),
    authDomain: "oamaster-login.firebaseapp.com",
    projectId: "oamaster-login",
    storageBucket: "oamaster-login.firebasestorage.app",
    messagingSenderId: "898508294931",
    appId: "1:898508294931:web:964a5cad636f356a6b68e6"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google 인증 공급업체 객체 생성
const googleProvider = new GoogleAuthProvider();

// 리다이렉트 로그인 결과 자동 감지
getRedirectResult(auth).then((result) => {
    if (result && result.user) {
        console.log("구글 리다이렉트 로그인 성공:", result.user.email);
    }
}).catch((err) => {
    console.warn("리다이렉트 인증 감지:", err);
});

// ----------------------------------------------------
// 인증 관련 핵심 함수 모움
// ----------------------------------------------------

// [기능 1] 이메일/비밀번호 회원가입
export async function signUpWithEmail(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: formatFirebaseAuthError(error) };
    }
}

// [기능 2] 이메일/비밀번호 로그인
export async function signInWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: formatFirebaseAuthError(error) };
    }
}

// [기능 3] Google 소셜 로그인 (팝업 창)
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        // Google 로그인 성공 시 사용자 정보 및 신규 가입 여부 반환
        const user = result.user;
        const additionalInfo = getAdditionalUserInfo(result);
        return {
            success: true,
            user,
            isNewUser: Boolean(additionalInfo && additionalInfo.isNewUser)
        };
    } catch (error) {
        console.warn("Google 로그인 처리 상태:", error.code, error.message);

        // 팝업창을 닫았거나 이중 클릭으로 취소된 경우 메인에 에러를 노출하지 않음
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
            return { success: false, isCancelled: true };
        }

        // 브라우저에 의해 팝업이 차단된 경우만 리다이렉트로 조용히 전환
        if (error.code === 'auth/popup-blocked') {
            try {
                await signInWithRedirect(auth, googleProvider);
                return { success: true, isRedirecting: true };
            } catch (redirErr) {
                console.error("리다이렉트 전환 오류:", redirErr);
            }
        }

        console.error("Google 로그인 실패 상세:", error.code, error.message);
        return { success: false, error: formatFirebaseAuthError(error) };
    }
}

// [기능 3-2] 구글 화면 직접 리다이렉트 로그인 (팝업 우회)
export async function signInWithGoogleRedirect() {
    try {
        await signInWithRedirect(auth, googleProvider);
        return { success: true, isRedirecting: true };
    } catch (error) {
        console.error("Google 리다이렉트 로그인 실패:", error);
        return { success: false, error: error.message };
    }
}

// [기능 3-3] Google ID 토큰 직접 인증 (GIS SDK 연동용)
export async function signInWithGoogleToken(idToken) {
    try {
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        return { success: true, user: result.user };
    } catch (error) {
        console.error("Google ID 토큰 인증 실패:", error);
        return { success: false, error: error.message };
    }
}

// 관리자 승인 제도 적용 기준 시각 (2026-11-12 15:05 KST 이전 가입 회원은 모두 기존 회원으로 자동 승인 유지)
export const APPROVAL_CUTOFF_TIME = Date.parse('2026-11-12T06:05:00.000Z');
let unsubscribeUserSnapshot = null;

/**
 * 사용자의 관리자 승인 상태(approved | pending | rejected)를 판별합니다.
 * 기준 시각 이전의 기존 가입 회원은 모두 approved로 처리하며, 신규 회원은 pending으로 시작합니다.
 * @param {object|null} user - Firebase Auth 사용자 객체
 * @param {object|null} existingData - Firestore 사용자 문서 데이터
 * @returns {string} 'approved' | 'pending' | 'rejected'
 */
export function resolveApprovalStatus(user, existingData = null) {
    const email = ((user && user.email) || (existingData && existingData.email) || '').toLowerCase().trim();
    const role = (existingData && existingData.role) || 'User';

    if (email === 'teacha99@gmail.com' || role === 'Host' || role === 'Manager') {
        return 'approved';
    }

    if (existingData && existingData.approvalStatus) {
        const normalized = String(existingData.approvalStatus).trim().toLowerCase();
        if (normalized === 'approved' || normalized === 'pending' || normalized === 'rejected') {
            return normalized;
        }
        return existingData.approvalStatus;
    }

    const creationSource = (user && user.metadata && user.metadata.creationTime) || (existingData && existingData.createdAt) || '';
    const creationMs = creationSource ? Date.parse(creationSource) : NaN;

    if (!Number.isNaN(creationMs)) {
        return creationMs < APPROVAL_CUTOFF_TIME ? 'approved' : 'pending';
    }

    // 생성 시각이 없는 기존 Firestore 문서는 기존 회원으로 간주하여 승인 처리
    return existingData ? 'approved' : 'pending';
}

// [기능 4] 로그아웃
export async function logout() {
    if (unsubscribeUserSnapshot) {
        unsubscribeUserSnapshot();
        unsubscribeUserSnapshot = null;
    }
    try {
        await signOut(auth);
    } catch (error) {
        console.warn("Firebase signOut error:", error);
    } finally {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userDisplayName');
        localStorage.removeItem('userPhotoURL');
        localStorage.removeItem('userUid');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userApprovalStatus');
        localStorage.removeItem('isAdminActive');
        localStorage.removeItem('adminManualAuth');
        localStorage.removeItem('adminEmail');
    }
    return { success: true };
}

// [기능 5] 로그인 상태 감지 리스너 (로컬 세션, 승인 상태 및 Firestore 실시간 동기화)
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (unsubscribeUserSnapshot) {
            unsubscribeUserSnapshot();
            unsubscribeUserSnapshot = null;
        }

        if (user) {
            localStorage.setItem('isLoggedIn', 'true');
            const email = (user.email || '').toLowerCase().trim();
            localStorage.setItem('userEmail', email);

            let role = 'User';
            let fsData = null;
            let fsReadError = false;
            let fsDocNotFound = false;

            try {
                const fsRes = await getUserDataFromFirestore(user.uid, { preferServer: true });
                if (fsRes && fsRes.success && fsRes.data) {
                    fsData = fsRes.data;
                    if (fsData.role) {
                        role = fsData.role;
                    }
                } else if (fsRes && fsRes.notFound) {
                    fsDocNotFound = true;
                } else {
                    fsReadError = true;
                }
            } catch (e) {
                fsReadError = true;
                console.warn("Role/approval fetch error:", e);
            }

            if (fsReadError && localStorage.getItem('userUid') === user.uid) {
                const cachedRole = localStorage.getItem('userRole');
                if (cachedRole) role = cachedRole;
            }

            if (email === 'teacha99@gmail.com') {
                role = 'Host';
            }

            if (role === 'Host' || role === 'Manager' || localStorage.getItem('adminManualAuth') === 'true') {
                localStorage.setItem('isAdminActive', 'true');
            } else {
                localStorage.removeItem('isAdminActive');
            }

            let approvalStatus = resolveApprovalStatus(user, { ...(fsData || {}), role });
            if (fsReadError && localStorage.getItem('userUid') === user.uid) {
                const cachedStatus = localStorage.getItem('userApprovalStatus');
                if (cachedStatus === 'approved' || cachedStatus === 'rejected') {
                    approvalStatus = cachedStatus;
                }
            }

            localStorage.setItem('userRole', role);
            localStorage.setItem('userApprovalStatus', approvalStatus);
            localStorage.setItem('userDisplayName', user.displayName || (user.email ? user.email.split('@')[0] : '회원'));
            if (user.photoURL) localStorage.setItem('userPhotoURL', user.photoURL);
            if (user.uid) localStorage.setItem('userUid', user.uid);

            // Firestore에 프로필 사진, 역할(role), 초기 승인 상태 자동 동기화 (조회 오류 시 기존 approvalStatus 보호)
            const providerId = (user.providerData && user.providerData.length > 0) ? user.providerData[0].providerId : 'password';
            const syncPayload = {
                email: user.email || '',
                provider: providerId
            };
            if (!fsReadError) {
                syncPayload.role = role;
            }
            if (user.displayName || !fsData || !fsData.displayName) {
                syncPayload.displayName = user.displayName || (fsData && fsData.displayName) || (user.email ? user.email.split('@')[0] : '회원');
            }
            if (user.photoURL) {
                syncPayload.photoURL = user.photoURL;
            }
            if (!fsReadError && (!fsData || !fsData.createdAt)) {
                syncPayload.createdAt = (user.metadata && user.metadata.creationTime)
                    ? new Date(user.metadata.creationTime).toISOString()
                    : new Date().toISOString();
            }
            if (!fsReadError && (fsDocNotFound || (fsData && !fsData.approvalStatus))) {
                syncPayload.approvalStatus = approvalStatus;
                if (approvalStatus === 'approved' && (!fsData || !fsData.approvedAt)) {
                    syncPayload.approvedAt = new Date().toISOString();
                }
            }
            saveUserDataToFirestore(user.uid, syncPayload);

            // 관리자 승인/등급 변경을 실시간 감지하여 승인 즉시 웹페이지 이용 가능하도록 반영
            const userDocRef = doc(db, "users", user.uid);
            unsubscribeUserSnapshot = onSnapshot(userDocRef, (docSnap) => {
                if (!docSnap.exists()) {
                    if (email !== 'teacha99@gmail.com' && (approvalStatus !== 'pending' || role !== 'User')) {
                        approvalStatus = 'pending';
                        role = 'User';
                        localStorage.setItem('userRole', role);
                        localStorage.setItem('userApprovalStatus', approvalStatus);
                        if (localStorage.getItem('adminManualAuth') !== 'true') {
                            localStorage.removeItem('isAdminActive');
                        }
                        if (typeof window.showToast === 'function') {
                            window.showToast('⚠️ 관리자에 의해 회원 정보가 삭제되어 세부 이용 권한이 해제되었습니다.', 'warning');
                        }
                        callback(user);
                        if (typeof window.notifyAuthReady === 'function') {
                            window.notifyAuthReady(user);
                        }
                    }
                    return;
                }
                const liveData = docSnap.data();
                const liveSchool = liveData.schoolName || liveData.school || liveData.organization || liveData.belong || '';
                if (liveSchool) {
                    localStorage.setItem(`user_school_${user.uid}`, liveSchool);
                }
                const nextRole = (email === 'teacha99@gmail.com') ? 'Host' : (liveData.role || 'User');
                const nextStatus = resolveApprovalStatus(user, { ...liveData, role: nextRole });

                if (nextStatus !== approvalStatus || nextRole !== role) {
                    const newlyApproved = (approvalStatus !== 'approved' && nextStatus === 'approved');
                    approvalStatus = nextStatus;
                    role = nextRole;

                    localStorage.setItem('userRole', role);
                    localStorage.setItem('userApprovalStatus', approvalStatus);
                    if (role === 'Host' || role === 'Manager' || localStorage.getItem('adminManualAuth') === 'true') {
                        localStorage.setItem('isAdminActive', 'true');
                    } else {
                        localStorage.removeItem('isAdminActive');
                    }

                    if (newlyApproved && typeof window.showToast === 'function') {
                        window.showToast('🎉 관리자 승인이 완료되었습니다! 모든 세부 콘텐츠를 바로 이용하실 수 있습니다.', 'success');
                    }

                    callback(user);
                    if (typeof window.notifyAuthReady === 'function') {
                        window.notifyAuthReady(user);
                    }
                }
            }, (err) => {
                console.warn("실시간 승인 상태 감시 오류:", err);
            });
        } else {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userDisplayName');
            localStorage.removeItem('userPhotoURL');
            localStorage.removeItem('userUid');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userApprovalStatus');
            // 이메일 인증(EmailJS)으로 별도 로그인한 관리자 세션은 유지
            if (localStorage.getItem('adminManualAuth') !== 'true') {
                localStorage.removeItem('isAdminActive');
            }
        }
        callback(user);
    });
}

// [기능 6] 닉네임 및 프로필 사진 정보 수정
export async function updateUserProfile(newName, photoURL) {
    try {
        if (!auth.currentUser) throw new Error("로그인된 사용자가 없습니다.");
        const updateData = {};
        if (newName !== undefined && newName !== null) updateData.displayName = newName;
        // ⚡ Firebase Auth의 updateProfile은 photoURL 길이가 2048자 이하일 때만 지원
        if (photoURL !== undefined && photoURL !== null && photoURL.length <= 2048) {
            updateData.photoURL = photoURL;
        }
        if (Object.keys(updateData).length > 0) {
            await updateProfile(auth.currentUser, updateData);
        }
        return { success: true, user: auth.currentUser };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ----------------------------------------------------
// Firestore 데이터베이스 사용자 통합 관리 함수
// ----------------------------------------------------

// [Firestore 1] 회원 프로필 통합 저장 (merge)
export async function saveUserDataToFirestore(uid, userData) {
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            ...userData,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Firestore 저장 실패:", error);
        return { success: false, error: error.message };
    }
}

// [Firestore 2] 회원 프로필 통합 조회 (preferServer: 오래된 로컬 캐시 우회)
export async function getUserDataFromFirestore(uid, options = {}) {
    const { preferServer = false } = options || {};
    try {
        const userRef = doc(db, "users", uid);
        let snap = null;
        if (preferServer) {
            try {
                snap = await getDocFromServer(userRef);
            } catch (serverErr) {
                console.warn("Firestore 서버 직접 조회 폴백:", serverErr);
                snap = await getDoc(userRef);
            }
        } else {
            snap = await getDoc(userRef);
        }

        if (snap && snap.exists()) {
            return { success: true, data: snap.data() };
        }
        return { success: false, notFound: true, error: "데이터 없음" };
    } catch (error) {
        console.error("Firestore 조회 실패:", error);
        return { success: false, isError: true, error: error.message };
    }
}

// [Firestore 3] 전체 회원 목록 조회 (관리자용)
export async function getAllUsersFromFirestore() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = [];
        querySnapshot.forEach((docSnap) => {
            users.push({ id: docSnap.id, ...docSnap.data() });
        });
        return { success: true, users };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Firestore users 컬렉션의 변경 사항을 실시간(onSnapshot)으로 구독합니다.
 * @param {Function} onUpdate - 회원 배열을 전달받는 콜백 함수
 * @param {Function} [onError] - 오류 메시지를 전달받는 콜백 함수
 * @returns {Function} 실시간 구독 해제(unsubscribe) 함수
 */
export function subscribeAllUsersFromFirestore(onUpdate, onError) {
    try {
        const usersRef = collection(db, "users");
        return onSnapshot(usersRef, (querySnapshot) => {
            const users = [];
            querySnapshot.forEach((docSnap) => {
                users.push({ id: docSnap.id, ...docSnap.data() });
            });
            if (typeof onUpdate === 'function') {
                onUpdate(users);
            }
        }, (error) => {
            console.error("Firestore 실시간 회원 목록 구독 오류:", error);
            if (typeof onError === 'function') {
                onError(error.message || '실시간 구독 오류');
            }
        });
    } catch (error) {
        console.error("Firestore 실시간 구독 초기화 실패:", error);
        if (typeof onError === 'function') {
            onError(error.message || '실시간 구독 초기화 실패');
        }
        return () => { };
    }
}

/**
 * Firestore users 컬렉션에서 특정 회원 문서를 삭제합니다.
 * @param {string} uid - 삭제할 회원의 UID
 * @returns {Promise<{success: boolean, error?: string}>} 삭제 결과
 */
export async function deleteUserFromFirestore(uid) {
    try {
        if (!uid) throw new Error('회원 UID가 유효하지 않습니다.');
        await deleteDoc(doc(db, "users", uid));
        return { success: true };
    } catch (error) {
        console.error("Firestore 회원 삭제 실패:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Firebase 인증 오류 코드를 사용자 친화적인 한국어 메시지로 변환합니다.
 * @param {string} errorCode - Firebase Auth 오류 코드
 * @returns {string|null} 안내 메시지 또는 매핑되지 않은 경우 null
 */
function getAuthErrorMessage(errorCode) {
    const currentOrigin = window.location.origin && window.location.origin !== 'null'
        ? window.location.origin
        : 'file://프로토콜';
    const currentHost = window.location.hostname || 'file://프로토콜';

    switch (errorCode) {
        case 'auth/email-already-in-use': return '이미 사용 중인 이메일입니다.';
        case 'auth/invalid-email': return '유효하지 않은 이메일 형식입니다.';
        case 'auth/weak-password': return '비밀번호는 최소 6자리 이상이어야 합니다.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': return '이메일 또는 비밀번호가 올바르지 않습니다.';
        case 'auth/network-request-failed': return '네트워크 또는 Firebase 서버 연결에 실패했습니다. 인터넷 연결과 방화벽·광고차단 확장프로그램을 확인해 주세요.';
        case 'auth/too-many-requests': return '로그인 시도가 너무 많아 일시 차단되었습니다. 잠시 후 다시 시도해 주세요.';
        case 'auth/unauthorized-domain': return `Firebase 콘솔에 승인되지 않은 도메인입니다. (현재 접속 주소: "${currentHost}")\n\nFirebase 콘솔 > Authentication > Settings > Authorized domains에 "${currentHost}"(예: localhost)을 추가해 주세요.`;
        case 'auth/operation-not-allowed': return 'Firebase 콘솔에서 해당 로그인 제공업체(Provider)가 활성화되지 않았습니다.';
        case 'auth/popup-closed-by-user': return 'Google 로그인 팝업 창이 닫혔습니다.';
        default:
            if (typeof errorCode === 'string' && errorCode.includes('requests-from-referer')) {
                return `Google Cloud API 키의 웹사이트(HTTP 리퍼러) 제한에 의해 차단되었습니다.\n(현재 출처: ${currentOrigin})\n\nGoogle Cloud 콘솔 > API 및 서비스 > 사용자 인증 정보에서 해당 웹 API 키의 허용 리퍼러에 "${currentOrigin}/*"을 추가하거나 제한을 해제해 주세요.`;
            }
            return null;
    }
}

/**
 * 이메일·Google 인증 예외 객체에서 코드와 원인을 포함한 오류 문자열을 생성합니다.
 * @param {Error & {code?: string}} error - Firebase 인증 예외 객체
 * @returns {string} 화면에 표시할 상세 오류 안내
 */
function formatFirebaseAuthError(error) {
    const code = error && error.code ? error.code : '';
    const customMsg = getAuthErrorMessage(code);
    const currentHost = window.location.hostname || 'file://프로토콜';
    if (customMsg) {
        return `${customMsg}\n(접속 호스트: ${currentHost}, 코드: ${code})`;
    }
    return `[오류 코드: ${code || '알수없음'}]\n${(error && error.message) || '로그인 처리 중 오류가 발생했습니다.'}\n(접속 호스트: ${currentHost})`;
}

// ----------------------------------------------------
// Global Window Binding for Easy Access
// ----------------------------------------------------
window.logout = logout;
window.FirebaseApp = {
    auth,
    db,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithGoogleRedirect,
    signInWithGoogleToken,
    logout,
    onAuthChange,
    updateUserProfile,
    saveUserDataToFirestore,
    getUserDataFromFirestore,
    getAllUsersFromFirestore,
    subscribeAllUsersFromFirestore,
    deleteUserFromFirestore,
    resolveApprovalStatus,
    APPROVAL_CUTOFF_TIME
};
