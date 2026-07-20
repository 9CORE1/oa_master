// --- Admin Mode Control & EmailJS Service Integration ---

// Check login status
function isAdmin() {
  return localStorage.getItem('isAdminActive') === 'true';
}

// Open Admin Auth Modal Directly
function openAdminAuthModalDirectly() {
  if (isAdmin()) {
    localStorage.setItem('isAdminActive', 'false');
    showToast('관리자 모드가 해제되었습니다.', 'success');
    updateAdminUI();
    setTimeout(() => window.location.reload(), 600);
    return;
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

// Toggle Admin Mode State
function toggleAdminMode(e) {
  if (e && e.preventDefault) {
    e.preventDefault();
    e.stopPropagation();
  }
  openAdminAuthModalDirectly();
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
    alert('관리자 모달 요소를 찾을 수 없습니다.');
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
  if (!emailInput) return;

  const loginEmail = emailInput.value.trim();
  if (!loginEmail) {
    showToast('이메일 주소를 입력해주세요.', 'error');
    return;
  }

  const settings = (window.DB && window.DB.getEmailJSSettings) ? window.DB.getEmailJSSettings() : {};
  const adminEmail = (settings.adminEmail || 'teacha99@gmail.com').trim();

  if (loginEmail.toLowerCase() !== adminEmail.toLowerCase()) {
    showToast('등록된 관리자 이메일 주소가 아닙니다.', 'error');
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
    showToast('EmailJS 설정이 누락되었습니다. F12 콘솔창에서 임시 인증번호를 확인하세요.', 'warning');
    console.log(`[OA MASTER Admin Auth Code] Temp Code: ${auth_code}`);
    switchToVerificationUI();
    return;
  }

  if (typeof emailjs === 'undefined') {
    showToast('EmailJS SDK가 로드되지 않았습니다. 콘솔창에서 임시 인증번호를 확인하세요.', 'error');
    console.log(`[OA MASTER Admin Auth Code] Temp Code: ${auth_code}`);
    switchToVerificationUI();
    return;
  }

  showToast('인증번호를 이메일로 발송 중입니다...', 'info');

  // Initialize emailjs
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
      showToast('인증번호가 관리자 이메일로 발송되었습니다.', 'success');
      switchToVerificationUI();
    }, error => {
      console.error('Email Verification Send FAILED...', error);
      showToast('인증 메일 발송에 실패했습니다. 콘솔창에서 임시 인증번호를 확인하세요.', 'error');
      console.log(`[OA MASTER Admin Auth Code] Temp Code: ${auth_code}`);
      switchToVerificationUI();
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
    showToast('관리자 모드로 인증되었습니다!', 'success');
    const modal = document.getElementById('adminAuthModal') || document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
    updateAdminUI();
    setTimeout(() => window.location.reload(), 800);
  } else {
    showToast('인증번호가 일치하지 않습니다. 다시 확인해 주세요.', 'error');
    codeInput.select();
  }
}

// Update UI elements based on current admin state
function updateAdminUI() {
  const adminBtn = document.getElementById('adminModeBtn');
  if (!adminBtn) return;
  
  const is_admin = isAdmin();
  
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
    
    const githubBtn = document.getElementById('githubSettingsBtn');
    if (githubBtn) githubBtn.remove();
    
    const jsonBtn = document.getElementById('jsonUpdateBtn');
    if (jsonBtn) jsonBtn.remove();
  }
  
  // Toggle visibility of admin-only content across the page
  const adminOnlyElements = document.querySelectorAll('.admin-only');
  adminOnlyElements.forEach(el => {
    if (is_admin) {
      el.style.setProperty('display', '', 'important');
    } else {
      el.style.setProperty('display', 'none', 'important');
    }
  });
}

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
            <label class="form-label" for="githubRepo">GitHub Repository (저장소 경로)</label>
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
    showToast('GitHub 연동 설정을 먼저 완료해 주세요.', 'warning');
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
    if (!localStorage.getItem("written_archive")) {
      localStorage.setItem("written_archive", JSON.stringify(DEFAULT_WRITTEN_ARCHIVE));
    }
    if (!localStorage.getItem("written_video")) {
      localStorage.setItem("written_video", JSON.stringify(DEFAULT_WRITTEN_VIDEO));
    }
    if (!localStorage.getItem("practical_archive")) {
      localStorage.setItem("practical_archive", JSON.stringify(DEFAULT_PRACTICAL_ARCHIVE));
    }
    if (!localStorage.getItem("practical_video")) {
      localStorage.setItem("practical_video", JSON.stringify(DEFAULT_PRACTICAL_VIDEO));
    }
    if (!localStorage.getItem("recommend_sites")) {
      localStorage.setItem("recommend_sites", JSON.stringify(DEFAULT_RECOMMEND_SITES));
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
