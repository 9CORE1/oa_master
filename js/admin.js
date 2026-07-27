// --- Admin Mode Control & EmailJS Service Integration ---

// Check login status
function isAdmin() {
  const userEmail = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
  const userRole = localStorage.getItem('userRole');
  if (userEmail === 'teacha99@gmail.com' || userRole === 'Host' || userRole === 'Manager') {
    return true;
  }
  return localStorage.getItem('isAdminActive') === 'true';
}

// Open Admin Auth Modal Directly
function openAdminAuthModalDirectly() {
  if (window.closeAllModals) {
    window.closeAllModals();
  } else {
    const authModal = document.getElementById('authModal');
    const myPageModal = document.getElementById('myPageModal');
    if (authModal) authModal.style.display = 'none';
    if (myPageModal) myPageModal.style.display = 'none';
  }

  const modal = document.getElementById('adminAuthModal');
  if (modal) {
    modal.style.display = 'flex';
    const emailInput = document.getElementById('adminLoginEmail');
    if (emailInput) {
      emailInput.value = '';
      emailInput.readOnly = false;
      setTimeout(() => emailInput.focus(), 100);
    }
    const codeGroup = document.getElementById('adminCodeGroup');
    if (codeGroup) codeGroup.style.display = 'none';

    const btnReq = document.getElementById('btnAdminRequestCode');
    if (btnReq) btnReq.style.display = 'inline-flex';

    const btnVer = document.getElementById('btnAdminVerifyCode');
    if (btnVer) btnVer.style.display = 'none';
  } else {
    showAdminLoginModal();
  }
}

// Toggle Admin Mode State (Login or Logout)
function toggleAdminMode(e) {
  if (e && e.preventDefault) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (isAdmin()) {
    if (localStorage.getItem('isLoggedIn') === 'true' && typeof handleGlobalLogout === 'function') {
      handleGlobalLogout();
      return;
    }
    localStorage.removeItem('isAdminActive');
    localStorage.removeItem('github_settings');
    sessionStorage.removeItem('admin_auth_code');

    if (window.showToast) window.showToast('관리자 모드가 해제되었습니다.', 'info');
    alert('🔓 관리자 모드가 성공적으로 해제(로그아웃)되었습니다.');
    updateAdminUI();

    // 회원 관리 페이지(admin_users.html)에서 관리자 로그아웃 시 일반 메인 페이지로 즉시 이동
    if (window.location.pathname.includes('admin_users.html') || window.location.href.includes('admin_users.html')) {
      window.location.href = 'index.html';
    }
  } else {
    openAdminAuthModalDirectly();
  }
}

// Show Admin Login modal
function showAdminLoginModal() {
  const modal = document.getElementById('adminAuthModal');
  if (modal) {
    modal.style.display = 'flex';
    const emailInput = document.getElementById('adminLoginEmail');
    if (emailInput) {
      emailInput.value = '';
      emailInput.readOnly = false;
      setTimeout(() => emailInput.focus(), 100);
    }
    const codeGroup = document.getElementById('adminCodeGroup');
    if (codeGroup) codeGroup.style.display = 'none';

    const btnReq = document.getElementById('btnAdminRequestCode');
    if (btnReq) btnReq.style.display = 'inline-flex';

    const btnVer = document.getElementById('btnAdminVerifyCode');
    if (btnVer) btnVer.style.display = 'none';
  } else {
    window.location.href = 'index.html';
  }
}

// Close any admin modal by id
function closeAdminModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.style.display = 'none';
}

// Request Email Verification Code using EmailJS
function requestVerificationCode() {
  const emailInput = document.getElementById('adminLoginEmail') || document.getElementById('loginEmail');
  if (!emailInput) {
    alert('이메일 입력란을 찾을 수 없습니다.');
    return;
  }

  const loginEmail = emailInput.value.trim();
  if (!loginEmail) {
    alert('❌ 관리자 이메일 주소를 입력해 주세요.');
    if (window.showToast) window.showToast('이메일 주소를 입력해주세요.', 'error');
    emailInput.focus();
    return;
  }

  const settings = (window.DB && window.DB.getEmailJSSettings) ? window.DB.getEmailJSSettings() : {};
  const validAdminEmails = [
    (settings.adminEmail || '').trim().toLowerCase(),
    'teacha99@gmail.com'
  ].filter(Boolean);

  const adminEmail = loginEmail.trim();
  const isValidAdmin = validAdminEmails.includes(loginEmail.toLowerCase());

  if (!isValidAdmin) {
    alert(`❌ 등록된 관리자 이메일 주소가 아닙니다. (${loginEmail})`);
    if (window.showToast) window.showToast('등록된 관리자 이메일 주소가 아닙니다.', 'error');
    return;
  }

  // Generate 6-digit random authentication code
  const auth_code = Math.floor(100000 + Math.random() * 900000).toString();
  sessionStorage.setItem('admin_auth_code', auth_code);

  const switchToVerificationUI = () => {
    if (emailInput) emailInput.readOnly = true;
    const codeGroup = document.getElementById('adminCodeGroup') || document.getElementById('codeVerificationGroup');
    if (codeGroup) codeGroup.style.display = 'block';

    const btnReq = document.getElementById('btnAdminRequestCode') || document.getElementById('btnRequestCode');
    if (btnReq) btnReq.style.display = 'none';

    const btnVer = document.getElementById('btnAdminVerifyCode') || document.getElementById('btnVerifyCode');
    if (btnVer) btnVer.style.display = 'inline-flex';

    const codeInput = document.getElementById('adminVerifyCodeInput') || document.getElementById('verificationCode');
    if (codeInput) {
      codeInput.focus();
      codeInput.onkeyup = (e) => {
        if (e.key === 'Enter') verifyAdminCode();
      };
    }
  };

  if (!settings.publicKey || !settings.serviceId || !settings.templateId) {
    alert('❌ EmailJS 연동 키(Public Key / Service ID / Template ID)가 설정되지 않았습니다.');
    showEmailJSSettingsModal();
    return;
  }

  if (typeof emailjs === 'undefined') {
    alert('❌ EmailJS SDK 라이브러리를 불러올 수 없습니다. 인터넷 연결을 확인해 주세요.');
    return;
  }

  if (window.showToast) window.showToast('인증번호를 이메일로 발송 중입니다...', 'info');

  emailjs.init(settings.publicKey);

  const templateParams = {
    action: '관리자 로그인 인증',
    title: '관리자 로그인 인증번호 안내',
    message: `관리자 로그인 인증번호는 [${auth_code}] 입니다. 인증 페이지에 이 번호를 입력해주세요.`,
    auth_code: auth_code,
    to_email: adminEmail,
    date: new Date().toLocaleString()
  };

  emailjs.send(settings.serviceId, settings.templateId, templateParams)
    .then(response => {
      alert(`📧 인증번호가 관리자 이메일(${adminEmail})로 성공적으로 발송되었습니다!`);
      if (window.showToast) window.showToast('인증번호가 발송되었습니다.', 'success');
      switchToVerificationUI();
    }, error => {
      console.error('Email Verification Send FAILED...', error);
      alert('❌ 인증번호 메일 전송 중 오류가 발생했습니다. EmailJS 설정이나 템플릿 항목을 확인해 주세요.');
      if (window.showToast) window.showToast('인증 메일 전송 실패', 'error');
    });
}

// Verify entered code
function verifyAdminCode() {
  const codeInput = document.getElementById('adminVerifyCodeInput') || document.getElementById('verificationCode');
  if (!codeInput) return;

  const enteredCode = codeInput.value.trim();
  const savedCode = sessionStorage.getItem('admin_auth_code');

  if (enteredCode === savedCode && savedCode) {
    sessionStorage.removeItem('admin_auth_code');
    localStorage.setItem('isAdminActive', 'true');
    alert('🎉 관리자 모드로 성황리에 인증되었습니다!');
    if (window.showToast) window.showToast('관리자 모드로 인증되었습니다!', 'success');
    const modal = document.getElementById('adminAuthModal') || document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
    updateAdminUI();
    setTimeout(() => window.location.reload(), 600);
  } else {
    alert('❌ 인증번호가 일치하지 않습니다. 다시 확인해 주세요.');
    if (window.showToast) window.showToast('인증번호가 일치하지 않습니다. 다시 확인해 주세요.', 'error');
    codeInput.select();
  }
}

// Update UI elements based on current admin state
function updateAdminUI() {
  const is_admin = isAdmin();

  const adminBtn = document.getElementById('adminModeBtn');
  if (adminBtn) {
    if (is_admin) {
      adminBtn.classList.add('active');
      adminBtn.innerHTML = '<i class="fas fa-lock-open"></i> 관리자 해제';
      
      // Inject GitHub Settings button into CTA area
      if (!document.getElementById('githubSettingsBtn')) {
        const githubBtn = document.createElement('button');
        githubBtn.id = 'githubSettingsBtn';
        githubBtn.className = 'btn-admin-mode';
        githubBtn.style.background = 'rgba(var(--theme-primary-rgb), 0.1)';
        githubBtn.style.color = 'var(--theme-primary)';
        githubBtn.innerHTML = '<i class="fab fa-github"></i> GitHub 설정';
        githubBtn.onclick = showGithubSettingsModal;
        adminBtn.parentNode.insertBefore(githubBtn, adminBtn);
      }
      
      // Inject Admin Users Manager button into CTA area
      if (!document.getElementById('adminUsersBtn')) {
        const usersBtn = document.createElement('button');
        usersBtn.id = 'adminUsersBtn';
        usersBtn.className = 'btn-admin-mode';
        usersBtn.style.background = 'rgba(var(--theme-primary-rgb), 0.15)';
        usersBtn.style.color = 'var(--theme-primary)';
        usersBtn.style.fontWeight = '700';
        usersBtn.innerHTML = '<i class="fas fa-users-cog"></i> 회원 관리';
        usersBtn.onclick = function() { window.location.href = 'admin_users.html'; };
        adminBtn.parentNode.insertBefore(usersBtn, adminBtn);
      }

      // Inject JSON Update button into CTA area
      if (!document.getElementById('jsonUpdateBtn')) {
        const jsonBtn = document.createElement('button');
        jsonBtn.id = 'jsonUpdateBtn';
        jsonBtn.className = 'btn-admin-mode';
        jsonBtn.style.background = 'rgba(var(--theme-primary-rgb), 0.1)';
        jsonBtn.style.color = 'var(--theme-primary)';
        jsonBtn.innerHTML = '<i class="fas fa-file-export"></i> JSON 업데이트';
        jsonBtn.onclick = updateJSONData;
        adminBtn.parentNode.insertBefore(jsonBtn, adminBtn);
      }
    } else {
      adminBtn.classList.remove('active');
      adminBtn.innerHTML = '<i class="fas fa-lock"></i> 관리자 모드';

      const usersBtn = document.getElementById('adminUsersBtn');
      if (usersBtn) usersBtn.remove();
      
      const githubBtn = document.getElementById('githubSettingsBtn');
      if (githubBtn) githubBtn.remove();
      
      const jsonBtn = document.getElementById('jsonUpdateBtn');
      if (jsonBtn) jsonBtn.remove();

      // 회원 관리 페이지에서 로그아웃 시 일반 메인 페이지로 자동 이동
      if (window.location.pathname.includes('admin_users.html') || window.location.href.includes('admin_users.html')) {
        window.location.href = 'index.html';
      }
    }
  }
  
  // Toggle visibility of admin-only content across the page
  const adminOnlyElements = document.querySelectorAll('.admin-only');
  adminOnlyElements.forEach(el => {
    if (is_admin) {
      if (el.tagName === 'TH' || el.tagName === 'TD') {
        el.style.setProperty('display', 'table-cell', 'important');
      } else if (el.classList.contains('action-buttons') || el.style.flexDirection === 'column') {
        el.style.setProperty('display', 'flex', 'important');
      } else if (el.tagName === 'BUTTON') {
        el.style.setProperty('display', 'inline-flex', 'important');
      } else {
        el.style.setProperty('display', 'block', 'important');
      }
    } else {
      el.style.setProperty('display', 'none', 'important');
    }
  });

  // Update footer bottom links dynamically
  const footerBottomLinksArr = document.querySelectorAll('.footer-bottom-links');
  footerBottomLinksArr.forEach(container => {
    if (is_admin) {
      container.innerHTML = `
        <a href="admin_users.html"><i class="fas fa-users-cog"></i> 회원 관리</a>
        <span style="color:var(--neutral-700);">|</span>
        <a href="#" onclick="if(window.handleGlobalLogout){window.handleGlobalLogout();}else{toggleAdminMode();} return false;"><i class="fas fa-sign-out-alt"></i> 관리자 로그아웃</a>
      `;
    } else {
      container.innerHTML = `
        <a href="#" onclick="toggleAdminMode(); return false;"><i class="fas fa-user-shield"></i> 관리자 로그인</a>
      `;
    }
  });
}

// Global User Logout Handler
async function handleGlobalLogout() {
  try {
    if (window.FirebaseApp && typeof window.FirebaseApp.logout === 'function') {
      await window.FirebaseApp.logout();
    } else if (typeof window.logout === 'function') {
      await window.logout();
    } else {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userDisplayName');
      localStorage.removeItem('userPhotoURL');
      localStorage.removeItem('userUid');
    }
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('isAdminActive');
    window.currentUser = null;
    const myPageModal = document.getElementById('myPageModal');
    if (myPageModal) myPageModal.style.display = 'none';

    if (typeof window.renderHeaderUserNav === 'function') {
      window.renderHeaderUserNav(null);
    }
    alert('로그아웃 되었습니다.');

    const pathname = window.location.pathname;
    if (pathname.includes('written_') || pathname.includes('practical_') || pathname.includes('recommendations') || pathname.includes('admin_users')) {
      if (localStorage.getItem('isAdminActive') !== 'true') {
        window.location.href = 'index.html';
      }
    }
  }
}
window.handleGlobalLogout = handleGlobalLogout;

// Global Document Click Delegation for Logout Buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#logoutBtn, #myPageLogoutBtn');
  if (btn) {
    e.preventDefault();
    handleGlobalLogout();
  }
});

// Universal Header User Nav Renderer for All Pages
function renderHeaderUserNavUniversal(user) {
  const userNav = document.getElementById('userNavArea');
  if (!userNav) return;

  const is_admin = isAdmin();
  const activeUser = user || window.currentUser || null;

  if (is_admin) {
    userNav.innerHTML = `
      <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(234,88,12,0.08); padding:4px 10px 4px 12px; border-radius:24px; border:1px solid rgba(234,88,12,0.3);">
        <span style="font-size:13px; font-weight:bold; color:#c2410c; display:inline-flex; align-items:center; gap:5px;">
          <i class="fas fa-user-shield" style="color:#ea580c;"></i> 관리자모드
        </span>
        <button id="headerJsonUpdateBtn" onclick="if(window.updateJSONData){window.updateJSONData();} return false;" style="background:#0284c7; color:#fff; border:none; padding:5px 12px; border-radius:16px; font-size:12px; font-weight:bold; cursor:pointer; transition:opacity 0.2s;" title="수정한 데이터를 GitHub 서버 소스코드로 자동 커밋 및 업데이트">
          <i class="fas fa-file-export"></i> JSON 업데이트
        </button>
        <button id="headerGithubSettingsBtn" onclick="if(window.showGithubSettingsModal){window.showGithubSettingsModal();} return false;" style="background:#475569; color:#fff; border:none; padding:5px 12px; border-radius:16px; font-size:12px; font-weight:bold; cursor:pointer; transition:opacity 0.2s;" title="GitHub 저장소 연동 설정">
          <i class="fab fa-github"></i> GitHub 설정
        </button>
        <button id="adminLogoutBtn" onclick="window.toggleAdminMode(); return false;" style="background:var(--theme-recommend, #e11d48); color:#fff; border:none; padding:5px 12px; border-radius:16px; font-size:12px; font-weight:bold; cursor:pointer; transition:opacity 0.2s;" title="관리자 모드 해제 및 로그아웃">
          <i class="fas fa-sign-out-alt"></i> 로그아웃
        </button>
      </div>
    `;
  } else if (activeUser) {
    const displayName = activeUser.displayName || (activeUser.email ? activeUser.email.split('@')[0] : '회원');
    const photoUrl = (activeUser && activeUser.photoURL) || localStorage.getItem('userPhotoURL') || null;
    const avatarIcon = photoUrl
      ? `<img src="${photoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; flex-shrink:0;">`
      : `<i class="fas fa-user-circle" style="color:var(--theme-written); font-size:18px;"></i>`;

    userNav.innerHTML = `
      <div style="display:inline-flex; align-items:center; gap:10px; background:rgba(14,73,135,0.06); padding:4px 8px 4px 12px; border-radius:24px; border:1px solid rgba(14,73,135,0.2);">
        <a href="index.html" style="font-size:13px; font-weight:bold; color:var(--neutral-900); text-decoration:none; display:inline-flex; align-items:center; gap:6px; cursor:pointer;" title="마이페이지">
          ${avatarIcon}
          <span>${displayName}님</span>
        </a>
        <button id="logoutBtn" onclick="window.handleGlobalLogout(); return false;" style="background:var(--theme-recommend); color:#fff; border:none; padding:5px 12px; border-radius:16px; font-size:12px; font-weight:bold; cursor:pointer; transition:opacity 0.2s;">로그아웃</button>
      </div>
    `;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        if (e) e.preventDefault();
        window.handleGlobalLogout();
      };
    }
  } else {
    userNav.innerHTML = `
      <button id="openAuthBtn" class="btn-admin-mode" onclick="if(document.getElementById('authModal')){document.getElementById('authModal').style.display='flex';}else if(window.openAuthModal){window.openAuthModal();}else{window.location.href='index.html?auth=required';} return false;" style="background:var(--theme-written); color:#fff; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-weight:600;"><i class="fas fa-user"></i> 로그인 / 회원가입</button>
    `;
  }
}

window.renderHeaderUserNav = renderHeaderUserNavUniversal;

// Show GitHub Settings Modal
function showGithubSettingsModal() {
  let settings = JSON.parse(localStorage.getItem("github_settings")) || { token: "", repo: "", path: "js/data.js", branch: "main" };
  const modalHTML = `
    <div class="modal-backdrop" id="githubSettingsModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fab fa-github"></i> GitHub 연동 설정</h3>
          <button class="btn-close-modal" onclick="closeAdminModal('githubSettingsModal')">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="githubToken">Personal Access Token (PAT)</label>
            <input type="password" id="githubToken" class="form-input" value="${settings.token || ''}" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx">
            <p class="form-helper">repo 권한이 허용된 클래식 토큰(PAT)을 입력해주세요.</p>
          </div>
          <div class="form-group">
            <label class="form-label" for="githubRepo">GitHub Repository (아이디/저장소 경로)</label>
            <input type="text" id="githubRepo" class="form-input" value="${settings.repo || ''}" placeholder="예: username/repo-name">
          </div>
          <div class="form-group">
            <label class="form-label" for="githubPath">업데이트할 데이터 파일 경로</label>
            <input type="text" id="githubPath" class="form-input" value="${settings.path || 'js/data.js'}" placeholder="예: js/data.js">
          </div>
          <div class="form-group">
            <label class="form-label" for="githubBranch">대상 브랜치 (Branch)</label>
            <input type="text" id="githubBranch" class="form-input" value="${settings.branch || 'main'}" placeholder="예: main">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-delete" onclick="clearGithubSettings()" style="margin-right: auto;"><i class="fas fa-trash-alt"></i> 설정 삭제</button>
          <button class="btn btn-secondary" onclick="closeAdminModal('githubSettingsModal')">취소</button>
          <button class="btn btn-primary" onclick="submitGithubSettings()">저장하기</button>
        </div>
      </div>
    </div>
  `;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHTML;
  document.body.appendChild(tempDiv.firstElementChild);
  
  setTimeout(() => {
    document.getElementById('githubSettingsModal').classList.add('open');
  }, 50);
}

function submitGithubSettings() {
  const token = document.getElementById('githubToken').value.trim();
  const repo = document.getElementById('githubRepo').value.trim();
  const path = document.getElementById('githubPath').value.trim();
  const branch = document.getElementById('githubBranch').value.trim();
  
  if (!token || !repo || !path || !branch) {
    showToast('모든 항목을 입력해주세요.', 'error');
    return;
  }
  
  localStorage.setItem("github_settings", JSON.stringify({
    token,
    repo,
    path,
    branch
  }));
  
  showToast('GitHub 설정이 저장되었습니다.', 'success');
  closeAdminModal('githubSettingsModal');
}

function clearGithubSettings() {
  if (!localStorage.getItem("github_settings")) {
    showToast('저장된 GitHub 설정이 없습니다.', 'warning');
    return;
  }
  
  if (!confirm('저장된 GitHub 연동 설정을 모두 삭제하시겠습니까?')) return;
  
  localStorage.removeItem("github_settings");
  showToast('GitHub 연동 설정이 삭제되었습니다.', 'success');
  closeAdminModal('githubSettingsModal');
}

// Update data source file on GitHub
async function updateJSONData() {
  const settings = JSON.parse(localStorage.getItem("github_settings")) || {};
  if (!settings.token || !settings.repo || !settings.path) {
    alert("💡 GitHub 연동 설정(Personal Access Token 및 저장소 이름)이 등록되어 있지 않습니다.\n\n열리는 설정 팝업창에 GitHub PAT 토큰과 Repository 경로(예: 내아이디/oa_master)를 입력해 주세요.");
    if (window.showToast) window.showToast('GitHub 연동 설정을 완료해 주세요.', 'warning');
    showGithubSettingsModal();
    return;
  }

  showToast('GitHub 데이터 업데이트를 시작합니다...', 'info');

  try {
    const repo = settings.repo;
    const path = settings.path;
    const branch = settings.branch || "main";
    const token = settings.token;

    const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
    const getRes = await fetch(url, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });

    let sha = null;
    if (getRes.status === 200) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    } else if (getRes.status !== 404) {
      throw new Error(`파일 정보를 가져오지 못했습니다. 상태코드: ${getRes.status}`);
    }

    const writtenArchive = localStorage.getItem("written_archive") || "[]";
    const writtenVideo = localStorage.getItem("written_video") || "[]";
    const practicalArchive = localStorage.getItem("practical_archive") || "[]";
    const practicalVideo = localStorage.getItem("practical_video") || "[]";
    const recommendSites = localStorage.getItem("recommend_sites") || "[]";

    const newContent = `// --- Core Database & Data Management Module (Local Storage) ---
// Generated automatically via GitHub Update action

const DEFAULT_WRITTEN_ARCHIVE = ${JSON.stringify(JSON.parse(writtenArchive), null, 2)};

const DEFAULT_WRITTEN_VIDEO = ${JSON.stringify(JSON.parse(writtenVideo), null, 2)};

const DEFAULT_PRACTICAL_ARCHIVE = ${JSON.stringify(JSON.parse(practicalArchive), null, 2)};

const DEFAULT_PRACTICAL_VIDEO = ${JSON.stringify(JSON.parse(practicalVideo), null, 2)};

const DEFAULT_RECOMMEND_SITES = ${JSON.stringify(JSON.parse(recommendSites), null, 2)};

// Database utility functions
const DB = {
  init() {
    const currentSignature = JSON.stringify({
      written_archive: DEFAULT_WRITTEN_ARCHIVE,
      written_video: DEFAULT_WRITTEN_VIDEO,
      practical_archive: DEFAULT_PRACTICAL_ARCHIVE,
      practical_video: DEFAULT_PRACTICAL_VIDEO,
      recommend_sites: DEFAULT_RECOMMEND_SITES
    });
    
    const savedSignature = localStorage.getItem("oa_master_defaults_signature");
    if (savedSignature !== currentSignature) {
      localStorage.setItem("written_archive", JSON.stringify(DEFAULT_WRITTEN_ARCHIVE));
      localStorage.setItem("written_video", JSON.stringify(DEFAULT_WRITTEN_VIDEO));
      localStorage.setItem("practical_archive", JSON.stringify(DEFAULT_PRACTICAL_ARCHIVE));
      localStorage.setItem("practical_video", JSON.stringify(DEFAULT_PRACTICAL_VIDEO));
      localStorage.setItem("recommend_sites", JSON.stringify(DEFAULT_RECOMMEND_SITES));
      localStorage.setItem("oa_master_defaults_signature", currentSignature);
    }
    
    if (!localStorage.getItem("emailjs_settings")) {
      localStorage.setItem("emailjs_settings", JSON.stringify({
        publicKey: "",
        serviceId: "",
        templateId: "",
        adminEmail: "admin@oamaster.co.kr"
      }));
    }
  },
  getAll(key) {
    this.init();
    return JSON.parse(localStorage.getItem(key)) || [];
  },
  getById(key, id) {
    const list = this.getAll(key);
    return list.find(item => item.id === id);
  },
  save(key, item) {
    const list = this.getAll(key);
    if (item.id) {
      const index = list.findIndex(i => i.id === item.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...item, date: new Date().toISOString().split('T')[0] };
      }
    } else {
      item.id = key.substring(0, 2) + '-' + Date.now();
      item.date = new Date().toISOString().split('T')[0];
      item.author = "관리자";
      list.push(item);
    }
    localStorage.setItem(key, JSON.stringify(list));
    return item;
  },
  delete(key, id) {
    let list = this.getAll(key);
    list = list.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  },
  moveUp(key, id) {
    const list = this.getAll(key);
    const index = list.findIndex(item => item.id === id);
    if (index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      localStorage.setItem(key, JSON.stringify(list));
      return true;
    }
    return false;
  },
  moveDown(key, id) {
    const list = this.getAll(key);
    const index = list.findIndex(item => item.id === id);
    if (index !== -1 && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      localStorage.setItem(key, JSON.stringify(list));
      return true;
    }
    return false;
  },
  getEmailJSSettings() {
    this.init();
    return JSON.parse(localStorage.getItem("emailjs_settings"));
  },
  saveEmailJSSettings(settings) {
    localStorage.setItem("emailjs_settings", JSON.stringify(settings));
    return true;
  }
};

window.DB = DB;
DB.init();
`;

    const putUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
    const body = {
      message: "admin: Update data source via Web JSON Update",
      content: btoa(unescape(encodeURIComponent(newContent))),
      branch: branch
    };
    if (sha) {
      body.sha = sha;
    }

    const putRes = await fetch(putUrl, {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (putRes.status === 200 || putRes.status === 201) {
      showToast('GitHub 데이터가 성공적으로 업데이트되었습니다! (수 초 후 웹페이지 반영)', 'success');
    } else {
      const errData = await putRes.json();
      throw new Error(errData.message || 'GitHub API 호출 오류');
    }
  } catch (error) {
    console.error(error);
    showToast(`업데이트 실패: ${error.message}`, 'error');
  }
}

// Send Notification via EmailJS
function sendAdminEmailNotification(action, title, messageText) {
  // 관리자모드로 로그인된 상태이므로 자료 등록/수정/삭제 시 추가 이메일 발송(인증 알림)을 생략합니다.
  return Promise.resolve(true);
}

// Add Admin UI Trigger to header when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Ensure the Admin toggle button triggers action
  const adminBtn = document.getElementById('adminModeBtn');
  if (adminBtn) {
    adminBtn.onclick = toggleAdminMode;
  }

  const btnAdminReq = document.getElementById('btnAdminRequestCode');
  if (btnAdminReq) btnAdminReq.onclick = requestVerificationCode;

  const btnAdminVer = document.getElementById('btnAdminVerifyCode');
  if (btnAdminVer) btnAdminVer.onclick = verifyAdminCode;

  const emailInput = document.getElementById('adminLoginEmail');
  if (emailInput) {
    emailInput.onkeyup = (e) => {
      if (e.key === 'Enter') requestVerificationCode();
    };
  }

  // Update UI components for initial state
  updateAdminUI();
});

// Show EmailJS Settings Modal
function showEmailJSSettingsModal() {
  const existingModal = document.getElementById('emailjsSettingsModal');
  if (existingModal) existingModal.remove();

  let settings = (window.DB && window.DB.getEmailJSSettings) ? window.DB.getEmailJSSettings() : {
    publicKey: "",
    serviceId: "",
    templateId: "",
    adminEmail: "teacha99@gmail.com"
  };

  const modalHTML = `
    <div class="modal-backdrop open" id="emailjsSettingsModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:99999999; display:flex; justify-content:center; align-items:center;">
      <div class="modal-content" style="background:#fff; padding:30px; border-radius:12px; max-width:480px; width:90%; position:relative; text-align:left; box-shadow:0 20px 25px -5px rgba(0,0,0,0.3);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid #eee; padding-bottom:10px;">
          <h3 style="margin:0; font-size:18px; color:#1e293b;"><i class="fas fa-envelope-open-text" style="color:var(--theme-written, #0e4987);"></i> EmailJS 연동 키 설정</h3>
          <button onclick="closeAdminModal('emailjsSettingsModal')" style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748b;">&times;</button>
        </div>
        <div class="modal-body" style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="display:block; font-weight:bold; font-size:13px; margin-bottom:4px; color:#334155;">Public Key (공개 키)</label>
            <input type="text" id="emailjsPublicKey" value="${settings.publicKey || ''}" placeholder="예: user_xxxxxxxxxxxx" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-weight:bold; font-size:13px; margin-bottom:4px; color:#334155;">Service ID (서비스 ID)</label>
            <input type="text" id="emailjsServiceId" value="${settings.serviceId || ''}" placeholder="예: service_xxxxxxx" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-weight:bold; font-size:13px; margin-bottom:4px; color:#334155;">Template ID (템플릿 ID)</label>
            <input type="text" id="emailjsTemplateId" value="${settings.templateId || ''}" placeholder="예: template_xxxxxxx" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-weight:bold; font-size:13px; margin-bottom:4px; color:#334155;">관리자 수신 이메일 주소</label>
            <input type="email" id="emailjsAdminEmail" value="${settings.adminEmail || 'teacha99@gmail.com'}" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px;">
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
          <button type="button" onclick="closeAdminModal('emailjsSettingsModal')" style="padding:8px 16px; background:#e2e8f0; border:none; border-radius:6px; cursor:pointer; font-weight:600; color:#475569;">취소</button>
          <button type="button" onclick="saveEmailJSSettingsFromModal()" style="padding:8px 16px; background:var(--theme-written, #0e4987); color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">설정 저장</button>
        </div>
      </div>
    </div>
  `;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHTML;
  document.body.appendChild(tempDiv.firstElementChild);
}

function saveEmailJSSettingsFromModal() {
  const publicKey = document.getElementById('emailjsPublicKey').value.trim();
  const serviceId = document.getElementById('emailjsServiceId').value.trim();
  const templateId = document.getElementById('emailjsTemplateId').value.trim();
  const adminEmail = document.getElementById('emailjsAdminEmail').value.trim();

  if (!publicKey || !serviceId || !templateId || !adminEmail) {
    alert('❌ 모든 EmailJS 항목을 입력해 주세요.');
    return;
  }

  const newSettings = { publicKey, serviceId, templateId, adminEmail };
  if (window.DB && window.DB.saveEmailJSSettings) {
    window.DB.saveEmailJSSettings(newSettings);
  } else {
    localStorage.setItem("emailjs_settings", JSON.stringify(newSettings));
  }

  alert('🎉 EmailJS 연동 설정이 성공적으로 저장되었습니다!');
  closeAdminModal('emailjsSettingsModal');
}

// --- Global YouTube ID Extractor ---
function extractYoutubeId(input) {
  if (!input) return '';
  const str = input.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = str.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  return str;
}

// --- Admin Quick Content Add Modal (자료실 / 영상보기 / 추천사이트) ---
function openQuickAddModal(defaultType = 'written_archive') {
  const existingModal = document.getElementById('quickAddModal');
  if (existingModal) existingModal.remove();

  const modalHTML = `
    <div class="modal-backdrop open" id="quickAddModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999999; display:flex; justify-content:center; align-items:center;">
      <div class="modal-content" style="background:#fff; padding:28px; border-radius:14px; max-width:520px; width:92%; position:relative; text-align:left; box-shadow:0 20px 30px rgba(0,0,0,0.3); max-height:90vh; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
          <h3 style="margin:0; font-size:19px; color:#0f172a; font-weight:700; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-plus-circle" style="color:#16a34a;"></i> 관리자 콘텐츠 신규 등록
          </h3>
          <button onclick="closeAdminModal('quickAddModal')" style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748b;">&times;</button>
        </div>

        <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <div>
            <label style="display:block; font-weight:700; font-size:13px; margin-bottom:6px; color:#334155;">등록할 항목 구분 (카테고리)</label>
            <select id="quickAddType" onchange="handleQuickAddTypeChange(this.value)" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; font-weight:600; background:#f8fafc; color:#0f172a;">
              <option value="written_archive" ${defaultType === 'written_archive' ? 'selected' : ''}>📁 [자료실] 필기과정 핵심요약 / 기출자료</option>
              <option value="practical_archive" ${defaultType === 'practical_archive' ? 'selected' : ''}>💻 [자료실] 실기과정 실습예제 / 서식자료</option>
              <option value="written_video" ${defaultType === 'written_video' ? 'selected' : ''}>🎥 [영상보기] 필기과정 이론 및 풀이강의</option>
              <option value="practical_video" ${defaultType === 'practical_video' ? 'selected' : ''}>🎬 [영상보기] 실기과정 엑셀/액세스/PPT강의</option>
              <option value="recommend_sites" ${defaultType === 'recommend_sites' ? 'selected' : ''}>🔗 [추천사이트] 외부 유용한 수험 링크</option>
            </select>
          </div>

          <div id="quickFormFields" style="display:flex; flex-direction:column; gap:14px;">
            <!-- Fields rendered dynamically via handleQuickAddTypeChange -->
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:22px; border-top:1px solid #f1f5f9; padding-top:14px;">
          <button type="button" onclick="closeAdminModal('quickAddModal')" style="padding:9px 18px; background:#e2e8f0; border:none; border-radius:8px; cursor:pointer; font-weight:600; color:#475569;">취소</button>
          <button type="button" onclick="submitQuickAddForm()" style="padding:9px 20px; background:#16a34a; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700; box-shadow:0 4px 12px rgba(22,163,74,0.3);">등록 완료</button>
        </div>
      </div>
    </div>
  `;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHTML;
  document.body.appendChild(tempDiv.firstElementChild);

  handleQuickAddTypeChange(defaultType);
}

function handleQuickAddTypeChange(type) {
  const container = document.getElementById('quickFormFields');
  if (!container) return;

  if (type === 'written_archive' || type === 'practical_archive') {
    const isWritten = type === 'written_archive';
    container.innerHTML = `
      <div>
        <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">자료 제목 *</label>
        <input type="text" id="qaTitle" placeholder="${isWritten ? '예: [핵심요약] 2026년 컴활 1급 필기 요약집' : '예: [실습파일] 엑셀 스프레드시트 기출 예제'}" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px;">
      </div>
      <div>
        <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">자료 설명 및 안내 *</label>
        <textarea id="qaDesc" placeholder="자료의 세부 특징 및 학습 활용법을 입력하세요." style="width:100%; height:70px; padding:9px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px; resize:vertical;"></textarea>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div>
          <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">급수 구분 *</label>
          <select id="qaGrade" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; background:#fff;">
            <option value="1급">1급</option>
            <option value="2급">2급</option>
            <option value="공통">공통 (1/2급)</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">파일 형식 (확장자)</label>
          <input type="text" id="qaFormat" placeholder="예: ZIP, PDF, XLSX" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px;">
        </div>
      </div>
      <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px dashed #cbd5e1; display:flex; flex-direction:column; gap:10px;">
        <div>
          <label style="display:block; font-weight:700; font-size:12px; margin-bottom:4px; color:#334155;">방법 A: 컴퓨터 파일 선택 (업로드)</label>
          <input type="file" id="qaFile" onchange="handleQuickAddFileSelected(this)" style="width:100%; font-size:12px; background:#fff; padding:6px; border:1px solid #cbd5e1; border-radius:6px;">
        </div>
        <div>
          <label style="display:block; font-weight:700; font-size:12px; margin-bottom:4px; color:#334155;"><i class="fab fa-google-drive" style="color:#34a853;"></i> 방법 B: 구글 드라이브 (또는 외부 공유 URL)</label>
          <input type="url" id="qaDriveUrl" placeholder="예: https://drive.google.com/file/d/..." style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:12px;">
        </div>
        <input type="hidden" id="qaFileName">
        <input type="hidden" id="qaFileSize">
      </div>
    `;
  } else if (type === 'written_video' || type === 'practical_video') {
    const isWritten = type === 'written_video';
    container.innerHTML = `
      <div>
        <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">강의 제목 *</label>
        <input type="text" id="qaTitle" placeholder="${isWritten ? '예: 컴퓨터활용능력 2급 필기 핵심 특강' : '예: 컴퓨터활용능력 1급 실기 엑셀 수식 완전정복'}" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px;">
      </div>
      <div>
        <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">강의 상세 설명 *</label>
        <textarea id="qaDesc" placeholder="동영상 강의 주제 및 커리큘럼 소개" style="width:100%; height:70px; padding:9px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px; resize:vertical;"></textarea>
      </div>
      <div>
        <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">유튜브 링크 또는 ID *</label>
        <input type="text" id="qaYoutube" placeholder="예: https://www.youtube.com/watch?v=NA6cU9s1GLU 또는 NA6cU9s1GLU" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px;">
        <p style="margin:4px 0 0; font-size:11px; color:#64748b;">유튜브 주소를 그대로 붙여넣으셔도 비디오 ID가 자동 추출됩니다.</p>
      </div>
      <div>
        <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">과목 급수 태그</label>
        <select id="qaTag" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
          <option value="1급">1급</option>
          <option value="2급">2급</option>
          <option value="기타">기타 (전체)</option>
        </select>
      </div>
    `;
  } else if (type === 'recommend_sites') {
    container.innerHTML = `
      <div>
        <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">사이트 이름 *</label>
        <input type="text" id="qaTitle" placeholder="예: 대한상공회의소 자격평가사업단" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px;">
      </div>
      <div>
        <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">사이트 URL (주소) *</label>
        <input type="url" id="qaUrl" placeholder="예: https://license.korcham.net" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px;">
      </div>
      <div>
        <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">사이트 소개 및 활용 팁 *</label>
        <textarea id="qaDesc" placeholder="수험생들을 위한 해당 사이트 활용 가이드" style="width:100%; height:70px; padding:9px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px; resize:vertical;"></textarea>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div>
          <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">카테고리</label>
          <select id="qaCategory" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
            <option value="공식 접수처">공식 접수처</option>
            <option value="학습 커뮤니티">학습 커뮤니티</option>
            <option value="인터넷 강의">인터넷 강의</option>
            <option value="무료 기출풀이">무료 기출풀이</option>
            <option value="기타 자료실">기타 자료실</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-weight:700; font-size:13px; margin-bottom:4px; color:#334155;">축약 태그</label>
          <input type="text" id="qaTag" placeholder="예: 상공회의소" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; font-size:13px;">
        </div>
      </div>
    `;
  }
}

function handleQuickAddFileSelected(input) {
  const file = input.files[0];
  if (!file) return;

  window.quickAddFileName = file.name;

  let sizeStr = "";
  if (file.size > 1024 * 1024) {
    sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
  } else {
    sizeStr = (file.size / 1024).toFixed(0) + " KB";
  }
  window.quickAddFileSize = sizeStr;

  const fnInput = document.getElementById('qaFileName');
  const fsInput = document.getElementById('qaFileSize');

  if (fnInput) fnInput.value = file.name;
  if (fsInput) fsInput.value = sizeStr;

  const reader = new FileReader();
  reader.onload = function(e) {
    window.quickAddFileData = e.target.result;
  };
  reader.readAsDataURL(file);
}

function submitQuickAddForm() {
  const type = document.getElementById('quickAddType').value;
  const title = document.getElementById('qaTitle') ? document.getElementById('qaTitle').value.trim() : '';
  const desc = document.getElementById('qaDesc') ? document.getElementById('qaDesc').value.trim() : '';

  if (!title || !desc) {
    alert('❌ 필수 입력 항목(제목, 설명)을 기입해주세요.');
    return;
  }

  let itemData = { title, description: desc };
  let typeLabel = "";

  if (type === 'written_archive' || type === 'practical_archive') {
    typeLabel = type === 'written_archive' ? '필기 자료실' : '실기 자료실';
    const driveUrl = document.getElementById('qaDriveUrl') ? document.getElementById('qaDriveUrl').value.trim() : '';
    const grade = document.getElementById('qaGrade') ? document.getElementById('qaGrade').value : '1급';
    const fileFormat = document.getElementById('qaFormat') ? document.getElementById('qaFormat').value.trim().toUpperCase() : '';
    let fileName = (document.getElementById('qaFileName') ? document.getElementById('qaFileName').value.trim() : '') || window.quickAddFileName;
    let fileSize = (document.getElementById('qaFileSize') ? document.getElementById('qaFileSize').value.trim() : '') || window.quickAddFileSize;

    if (driveUrl && (!fileName || fileName === '자료.zip')) {
      fileName = '구글드라이브_공유자료.zip';
      fileSize = 'Google Drive';
    }

    if (!fileName && !driveUrl) {
      alert('❌ 파일을 선택하거나 구글 드라이브 링크를 입력해주세요.');
      return;
    }

    itemData.grade = grade;
    itemData.fileName = fileName || '자료.zip';
    itemData.fileSize = fileSize || '1.0 MB';
    if (fileFormat) itemData.fileFormat = fileFormat;
    if (driveUrl) itemData.fileDriveUrl = driveUrl;
    if (window.quickAddFileData) itemData.fileData = window.quickAddFileData;
  } else if (type === 'written_video' || type === 'practical_video') {
    typeLabel = type === 'written_video' ? '필기 영상강의' : '실기 영상강의';
    const rawYoutube = document.getElementById('qaYoutube') ? document.getElementById('qaYoutube').value.trim() : '';
    const tag = document.getElementById('qaTag') ? document.getElementById('qaTag').value : '1급';
    const youtubeId = extractYoutubeId(rawYoutube);

    if (!youtubeId) {
      alert('❌ 올바른 유튜브 주소 또는 비디오 ID를 입력해주세요.');
      return;
    }
    itemData.youtubeId = youtubeId;
    itemData.tag = tag;
  } else if (type === 'recommend_sites') {
    typeLabel = '추천 사이트';
    const siteUrl = document.getElementById('qaUrl') ? document.getElementById('qaUrl').value.trim() : '';
    const category = document.getElementById('qaCategory') ? document.getElementById('qaCategory').value : '공식 접수처';
    const tag = document.getElementById('qaTag') ? document.getElementById('qaTag').value.trim() : '링크';

    if (!siteUrl) {
      alert('❌ 사이트 URL 주소를 입력해주세요.');
      return;
    }
    itemData.siteUrl = siteUrl;
    itemData.category = category;
    itemData.tag = tag || '링크';
  }

  // Save item using DB.save
  window.DB.save(type, itemData);

  if (window.showToast) {
    window.showToast(`🎉 [${typeLabel}] 신규 콘텐츠가 성공적으로 등록되었습니다!`, 'success');
  } else {
    alert(`🎉 [${typeLabel}] 신규 콘텐츠가 성공적으로 등록되었습니다!`);
  }

  closeAdminModal('quickAddModal');

  // Trigger state refresh
  window.dispatchEvent(new CustomEvent('adminStateChanged'));

  // If page rendering functions exist, invoke them
  if (window.renderArchiveTable) window.renderArchiveTable();
  if (window.renderPlaylist) window.renderPlaylist();
  if (window.renderSitesGrid) window.renderSitesGrid();
}

// Export functions to window scope
window.isAdmin = isAdmin;
window.toggleAdminMode = toggleAdminMode;
window.openAdminAuthModalDirectly = openAdminAuthModalDirectly;
window.updateAdminUI = updateAdminUI;
window.closeAdminModal = closeAdminModal;
window.sendAdminEmailNotification = sendAdminEmailNotification;
window.requestVerificationCode = requestVerificationCode;
window.verifyAdminCode = verifyAdminCode;
window.showGithubSettingsModal = showGithubSettingsModal;
window.submitGithubSettings = submitGithubSettings;
window.clearGithubSettings = clearGithubSettings;
window.updateJSONData = updateJSONData;
window.showEmailJSSettingsModal = showEmailJSSettingsModal;
window.saveEmailJSSettingsFromModal = saveEmailJSSettingsFromModal;
window.renderHeaderUserNavUniversal = renderHeaderUserNavUniversal;
window.extractYoutubeId = extractYoutubeId;
window.openQuickAddModal = openQuickAddModal;
window.handleQuickAddTypeChange = handleQuickAddTypeChange;
window.handleQuickAddFileSelected = handleQuickAddFileSelected;
window.submitQuickAddForm = submitQuickAddForm;

// Auto-initialize Admin UI on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof updateAdminUI === 'function') updateAdminUI();
  });
} else {
  if (typeof updateAdminUI === 'function') updateAdminUI();
}

