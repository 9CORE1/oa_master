// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 1. Firebase 콘솔 > 프로젝트 설정에서 복사한 firebaseConfig 키값 입력
const firebaseConfig = {
    apiKey: "AIzaSyBdTrtUWJ06fI2OH8Ry5L2fcjAeg4tMAWw",
    authDomain: "oamaster-login.firebaseapp.com",
    projectId: "oamaster-login",
    storageBucket: "oamaster-login.firebasestorage.app",
    messagingSenderId: "898508294931",
    appId: "1:898508294931:web:964a5cad636f356a6b68e6"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google 인증 공급업체 객체 생성
const googleProvider = new GoogleAuthProvider();

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
        console.error("Google 로그인 실패:", error);
        return { success: false, error: "Google 로그인 처리 중 오류가 발생했습니다." };
    }
}

// [기능 4] 로그아웃
export async function logout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// [기능 5] 로그인 상태 감지 리스너
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
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
        default: return '오류가 발생했습니다. 다시 시도해 주세요.';
    }
}
