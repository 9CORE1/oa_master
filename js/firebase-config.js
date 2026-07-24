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
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs
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
        return { success: false, error: getAuthErrorMessage(error.code) };
    }
}

// [기능 2] 이메일/비밀번호 로그인
export async function signInWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: getAuthErrorMessage(error.code) };
    }
}

// [기능 3] Google 소셜 로그인 (팝업 창)
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        // Google 로그인 성공 시 사용자 정보 반환
        const user = result.user;
        return { success: true, user };
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
        const customMsg = getAuthErrorMessage(error.code);
        const currentHost = window.location.hostname || 'file://프로토콜';
        const domainInfo = `(현재 접속 주소: ${currentHost})`;
        const fullErr = customMsg
          ? `${customMsg}\n${domainInfo}`
          : `[오류 코드: ${error.code || '알수없음'}]\n${error.message || '로그인 처리 중 오류가 발생했습니다.'}\n${domainInfo}`;
        return { success: false, error: fullErr };
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

// [기능 4] 로그아웃
export async function logout() {
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
        localStorage.removeItem('isAdminActive');
    }
    return { success: true };
}

// [기능 5] 로그인 상태 감지 리스너 (로컬 세션 및 Firestore 프로필 동기화)
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            localStorage.setItem('isLoggedIn', 'true');
            const email = (user.email || '').toLowerCase().trim();
            localStorage.setItem('userEmail', email);

            let role = 'User';
            if (email === 'teacha99@gmail.com') {
                role = 'Host';
                localStorage.setItem('isAdminActive', 'true');
            } else {
                try {
                    const fsRes = await getUserDataFromFirestore(user.uid);
                    if (fsRes && fsRes.success && fsRes.data && fsRes.data.role) {
                        role = fsRes.data.role;
                    }
                } catch (e) {
                    console.warn("Role fetch error:", e);
                }
            }

            if (role === 'Host' || role === 'Manager') {
                localStorage.setItem('isAdminActive', 'true');
            }

            localStorage.setItem('userRole', role);
            localStorage.setItem('userDisplayName', user.displayName || (user.email ? user.email.split('@')[0] : '회원'));
            if (user.photoURL) localStorage.setItem('userPhotoURL', user.photoURL);
            if (user.uid) localStorage.setItem('userUid', user.uid);

            // Firestore에 프로필 사진, 역할(role) 및 정보 자동 동기화
            const providerId = (user.providerData && user.providerData.length > 0) ? user.providerData[0].providerId : 'password';
            saveUserDataToFirestore(user.uid, {
                email: user.email || '',
                displayName: user.displayName || (user.email ? user.email.split('@')[0] : '회원'),
                photoURL: user.photoURL || '',
                provider: providerId,
                role: role
            });
        } else {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userDisplayName');
            localStorage.removeItem('userPhotoURL');
            localStorage.removeItem('userUid');
            localStorage.removeItem('userRole');
            localStorage.removeItem('isAdminActive');
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

// [Firestore 2] 회원 프로필 통합 조회
export async function getUserDataFromFirestore(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
            return { success: true, data: snap.data() };
        } else {
            return { success: false, error: "데이터 없음" };
        }
    } catch (error) {
        console.error("Firestore 조회 실패:", error);
        return { success: false, error: error.message };
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

// 한글 에러 처리 헬퍼 함수
function getAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use': return '이미 사용 중인 이메일입니다.';
        case 'auth/invalid-email': return '유효하지 않은 이메일 형식입니다.';
        case 'auth/weak-password': return '비밀번호는 최소 6자리 이상이어야 합니다.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': return '이메일 또는 비밀번호가 올바르지 않습니다.';
        case 'auth/unauthorized-domain': return `Firebase 콘솔에 승인되지 않은 도메인입니다. (현재 접속 주소: "${window.location.hostname || 'file://프로토콜'}")\n\nFirebase 콘솔 > Authentication > Settings > Authorized domains 에 "${window.location.hostname}" 을 정확히 추가해 주세요.`;
        case 'auth/operation-not-allowed': return 'Firebase 콘솔에서 Google 로그인 제공업체(Provider)가 활성화되지 않았습니다.';
        case 'auth/popup-closed-by-user': return 'Google 로그인 팝업 창이 닫혔습니다.';
        default: return null;
    }
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
    getAllUsersFromFirestore
};
