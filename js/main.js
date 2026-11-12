// --- Main UI & Common Interactions Module ---

const PROTECTED_DETAIL_PAGES = [
  'written_archive.html',
  'written_lectures.html',
  'practical_archive.html',
  'practical_lectures.html',
  'ai_office_day1.html',
  'ai_office_day2.html',
  'ai_office_day3.html'
];

let verifiedAuthState = null;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeaderScroll();
  initMobileNav();
  initToastContainer();
  initProtectedDetailLinks();
});

// 1. Initialize theme based on body class or current page name
function initTheme() {
  const path = window.location.pathname;
  const body = document.body;

  if (path.includes('written_') || path.includes('cert_course') || path.includes('ai_office_day2')) {
    body.className = 'theme-written';
  } else if (path.includes('practical_') || path.includes('ai_office_day1')) {
    body.className = 'theme-practical';
  } else if (path.includes('recommendations') || path.includes('ai_office_day3')) {
    body.className = 'theme-recommend';
  } else {
    body.className = 'theme-written'; // Default main theme
  }
}

// 2. Sticky Header scroll styling
function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger once on load
}

// 3. Mobile Hamburger Navigation Drawer
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const closeBtn = document.querySelector('.btn-close-mobile');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const overlay = document.querySelector('.mobile-nav-overlay');

  if (!toggleBtn || !drawer || !overlay) return;

  const openMenu = () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  };

  const closeMenu = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = ''; // Unlock background scroll
  };

  toggleBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  // Close menu if link clicked (especially on anchor link jumps)
  const mobileLinks = drawer.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// 4. Toast Notification Creator
function initToastContainer() {
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconClass = 'fa-check-circle';
  if (type === 'error') iconClass = 'fa-times-circle';
  if (type === 'warning') iconClass = 'fa-exclamation-circle';

  toast.innerHTML = `
    <i class="fas ${iconClass} toast-icon"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove toast
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

/**
 * 현재 사용자가 로그인 세션을 보유하고 있는지(관리자 포함) 확인합니다.
 * @returns {boolean} 로그인 세션 보유 여부
 */
function isMemberLoggedInSession() {
  const isAdminSession = (typeof window.isAdmin === 'function' && window.isAdmin()) ||
    (localStorage.getItem('isAdminActive') === 'true');
  if (isAdminSession) return true;
  if (verifiedAuthState !== null) return verifiedAuthState;
  return localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * 현재 로그인 회원의 관리자 승인 상태를 반환합니다.
 * @returns {string} 'approved' | 'pending' | 'rejected'
 */
function getMemberApprovalStatus() {
  const isAdminSession = (typeof window.isAdmin === 'function' && window.isAdmin()) ||
    (localStorage.getItem('isAdminActive') === 'true');
  if (isAdminSession) return 'approved';
  return localStorage.getItem('userApprovalStatus') || 'pending';
}

/**
 * 현재 사용자가 승인 완료된 회원 또는 관리자 인증 상태인지 판별합니다.
 * @returns {boolean} 세부 콘텐츠 접근 권한 보유 여부
 */
function isMemberAuthenticated() {
  const isAdminSession = (typeof window.isAdmin === 'function' && window.isAdmin()) ||
    (localStorage.getItem('isAdminActive') === 'true');
  if (isAdminSession) return true;
  return isMemberLoggedInSession() && getMemberApprovalStatus() === 'approved';
}

/**
 * Firebase 인증 상태 변경 결과를 전역에 반영하고 구독자에게 알립니다.
 * @param {object|null} user - Firebase 사용자 객체 또는 null
 */
/**
 * 승인된 일반 회원이 세부 콘텐츠 페이지에 접근하거나 이동한 이력을 기록합니다.
 * @param {object|null} sourceUser - Firebase 인증 사용자 객체(선택)
 * @param {string} [targetHref=''] - 클릭한 세부 링크 대상 경로(선택)
 */
function recordMemberDetailAccessHistory(sourceUser = null, targetHref = '') {
  try {
    const isAdminSession = (typeof window.isAdmin === 'function' && window.isAdmin()) ||
      (localStorage.getItem('isAdminActive') === 'true');
    if (isAdminSession || !isMemberAuthenticated()) return;

    const uid = (sourceUser && sourceUser.uid) || localStorage.getItem('userUid');
    if (!uid) return;

    const currentFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const isDetailPage = Boolean(currentFile) &&
      currentFile !== 'index.html' &&
      !currentFile.startsWith('admin');

    if (!targetHref && !isDetailPage) return;

    const targetName = targetHref || currentFile || 'detail_page';
    const isFirstLocalRecord = localStorage.getItem(`oa_detail_access_history_${uid}`) !== 'true';
    localStorage.setItem(`oa_detail_access_history_${uid}`, 'true');
    localStorage.setItem(`oa_approval_notice_ack_${uid}`, 'true');

    const syncKey = `oa_detail_access_synced_${uid}`;
    if (sessionStorage.getItem(syncKey) === 'true' && !targetHref) return;

    const nowIso = new Date().toISOString();
    const payload = {
      approvalNoticeAck: true,
      detailAccessHistoryRecorded: true,
      lastDetailAccessedAt: nowIso,
      lastDetailPage: targetName
    };
    if (isFirstLocalRecord) {
      payload.firstDetailAccessedAt = nowIso;
    }

    if (window.FirebaseApp && typeof window.FirebaseApp.saveUserDataToFirestore === 'function') {
      sessionStorage.setItem(syncKey, 'true');
      window.FirebaseApp.saveUserDataToFirestore(uid, payload).catch((err) => {
        sessionStorage.removeItem(syncKey);
        console.warn('세부 페이지 접근 이력 동기화 실패:', err);
      });
    }
  } catch (err) {
    console.warn('세부 페이지 접근 이력 기록 오류:', err);
  }
}

function notifyAuthReady(user) {
  verifiedAuthState = Boolean(user);
  if (user) {
    recordMemberDetailAccessHistory(user);
  }
  window.dispatchEvent(new CustomEvent('oaAuthReady', {
    detail: { user, approvalStatus: getMemberApprovalStatus() }
  }));
}

/**
 * 비로그인 또는 관리자 미승인 상태에서 회원 전용 기능/세부 페이지 접근 시 안내합니다.
 * @param {string} [message] - 비로그인 사용자에게 보여줄 안내 문구
 */
function requireMemberLogin(message = '🔒 회원가입 및 로그인 후 이용하실 수 있습니다.') {
  if (isMemberLoggedInSession()) {
    const status = getMemberApprovalStatus();
    if (typeof window.openApprovalWaitingModal === 'function') {
      window.openApprovalWaitingModal(null, status);
      return;
    }
    if (status === 'rejected') {
      alert('⛔ 현재 계정은 관리자 승인 보류 상태입니다.\n이용 관련 사항은 관리자에게 문의해 주세요.');
    } else {
      alert('⏳ 회원가입 및 로그인은 완료되었으나 현재 관리자 승인 대기 중입니다.\n관리자 승인 완료 후 바로 세부 콘텐츠를 이용하실 수 있습니다.');
    }
    return;
  }

  const authModal = document.getElementById('authModal');
  alert(message);
  if (authModal) {
    authModal.style.display = 'flex';
  } else {
    window.location.href = 'index.html?auth=required';
  }
}

/**
 * 지정된 컨테이너에 회원 전용 잠금(비로그인 또는 관리자 승인 대기) 안내 카드를 렌더링합니다.
 * @param {HTMLElement} container - 잠금 안내를 표시할 DOM 요소
 * @param {object} [options] - 제목, 설명, 테마 옵션
 */
function renderMemberGateBox(container, options = {}) {
  if (!container) return;
  const {
    title = '회원가입 및 로그인 후 세부 내용을 이용할 수 있습니다',
    description = '허브 페이지에서는 전체 과정과 이용 안내를 자유롭게 열람할 수 있으며, 세부 학습 기능과 상세 콘텐츠는 로그인 회원에게 제공됩니다.',
    buttonLabel = '회원가입 / 로그인하고 전체 보기',
    theme = 'written'
  } = options;

  const extraClass = theme === 'recommend' ? ' recommend-gate' : '';

  if (isMemberLoggedInSession()) {
    const status = getMemberApprovalStatus();
    const isRejected = status === 'rejected';
    const pendingTitle = isRejected
      ? '관리자 승인 보류 상태입니다'
      : '관리자 승인 대기 중입니다';
    const pendingDesc = isRejected
      ? '현재 계정은 세부 콘텐츠 열람 승인이 보류되어 있습니다. 승인 상태는 마이페이지에서 확인하시거나 관리자에게 문의해 주세요.'
      : '회원가입 및 로그인이 정상 확인되었습니다. 관리자가 승인하는 즉시(새로고침 없이 자동으로) 모든 세부 콘텐츠와 기능이 열립니다.';

    container.innerHTML = `
      <div class="member-gate-card${extraClass}">
        <div class="member-gate-icon"><i class="fas ${isRejected ? 'fa-user-slash' : 'fa-user-clock'}"></i></div>
        <h3>${pendingTitle}</h3>
        <p>${pendingDesc}</p>
        <div class="member-gate-actions">
          <a href="index.html?mypage=1" class="member-gate-btn">
            <i class="fas fa-id-card"></i> 마이페이지에서 승인 상태 확인
          </a>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="member-gate-card${extraClass}">
      <div class="member-gate-icon"><i class="fas fa-lock"></i></div>
      <h3>${title}</h3>
      <p>${description}</p>
      <div class="member-gate-actions">
        <a href="index.html?auth=required" class="member-gate-btn">
          <i class="fas fa-user-check"></i> ${buttonLabel}
        </a>
      </div>
    </div>
  `;
}

/**
 * 서브페이지에서 회원 전용 세부 페이지 링크 클릭 시 비로그인 접근을 선차단합니다.
 */
function initProtectedDetailLinks() {
  const isHome = window.location.pathname.endsWith('/') ||
    window.location.pathname.endsWith('index.html');
  if (isHome) return;

  recordMemberDetailAccessHistory();

  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button');
    if (!target) return;
    if (target.closest('#adminAuthModal') || target.closest('.member-gate-card')) return;

    const href = target.getAttribute('href') || target.getAttribute('onclick') || '';
    if (PROTECTED_DETAIL_PAGES.some((page) => href.includes(page))) {
      if (!isMemberAuthenticated()) {
        e.preventDefault();
        e.stopPropagation();
        requireMemberLogin('🔒 회원가입 및 로그인이 필요한 세부 학습 페이지입니다.');
      } else {
        recordMemberDetailAccessHistory(null, href);
      }
    }
  }, true);
}

// Export functions to window scope
window.showToast = showToast;
window.PROTECTED_DETAIL_PAGES = PROTECTED_DETAIL_PAGES;
window.isMemberLoggedInSession = isMemberLoggedInSession;
window.getMemberApprovalStatus = getMemberApprovalStatus;
window.isMemberAuthenticated = isMemberAuthenticated;
window.recordMemberDetailAccessHistory = recordMemberDetailAccessHistory;
window.notifyAuthReady = notifyAuthReady;
window.requireMemberLogin = requireMemberLogin;
window.renderMemberGateBox = renderMemberGateBox;
