// --- Admin Mode Control & EmailJS Service Integration ---

// Check login status
function isAdmin() {
  return localStorage.getItem('isAdminActive') === 'true';
}

// Toggle Admin Mode State
function toggleAdminMode() {
  if (isAdmin()) {
    // Logout
    localStorage.setItem('isAdminActive', 'false');
    showToast('관리자 모드가 해제되었습니다.', 'success');
    updateAdminUI();
    // Reload page to reflect UI changes
    setTimeout(() => window.location.reload(), 800);
  } else {
    // Open password login prompt modal
    showAdminLoginModal();
  }
}

// Show Admin Login modal
function showAdminLoginModal() {
  const modalHTML = `
    <div class="modal-backdrop" id="loginModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-lock"></i> 관리자 인증</h3>
          <button class="btn-close-modal" onclick="closeAdminModal('loginModal')">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="adminPassword">관리자 비밀번호</label>
            <input type="password" id="adminPassword" class="form-input" placeholder="비밀번호를 입력하세요 (기본: admin1234)">
            <p class="form-helper">웹페이지 관리를 위한 패스워드를 입력하세요.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeAdminModal('loginModal')">취소</button>
          <button class="btn btn-primary" onclick="submitAdminLogin()">인증하기</button>
        </div>
      </div>
    </div>
  `;
  
  // Append modal to body
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHTML;
  document.body.appendChild(tempDiv.firstElementChild);
  
  // Open modal animation
  setTimeout(() => {
    document.getElementById('loginModal').classList.add('open');
    document.getElementById('adminPassword').focus();
    // Add enter key event
    document.getElementById('adminPassword').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') submitAdminLogin();
    });
  }, 50);
}

// Close any admin modal by id
function closeAdminModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => modal.remove(), 300);
}

// Validate credentials
function submitAdminLogin() {
  const passwordInput = document.getElementById('adminPassword');
  if (!passwordInput) return;
  
  const password = passwordInput.value;
  // Default master password
  if (password === 'admin1234') {
    localStorage.setItem('isAdminActive', 'true');
    showToast('관리자 모드로 인증되었습니다!', 'success');
    closeAdminModal('loginModal');
    updateAdminUI();
    // Reload page to reflect UI changes
    setTimeout(() => window.location.reload(), 800);
  } else {
    showToast('비밀번호가 올바르지 않습니다.', 'error');
    passwordInput.select();
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
    
    // Inject email settings gear icon into CTA area
    if (!document.getElementById('emailSettingsBtn')) {
      const emailBtn = document.createElement('button');
      emailBtn.id = 'emailSettingsBtn';
      emailBtn.className = 'btn-admin-mode';
      emailBtn.style.background = 'rgba(var(--theme-primary-rgb), 0.1)';
      emailBtn.style.color = 'var(--theme-primary)';
      emailBtn.innerHTML = '<i class="fas fa-cog"></i> EmailJS 설정';
      emailBtn.onclick = showEmailSettingsModal;
      adminBtn.parentNode.insertBefore(emailBtn, adminBtn);
    }
  } else {
    adminBtn.classList.remove('active');
    adminBtn.innerHTML = '<i class="fas fa-lock"></i> 관리자 모드';
    
    const emailBtn = document.getElementById('emailSettingsBtn');
    if (emailBtn) emailBtn.remove();
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

// Show EmailJS Settings Modal
function showEmailSettingsModal() {
  const settings = window.DB.getEmailJSSettings();
  const modalHTML = `
    <div class="modal-backdrop" id="settingsModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-envelope-open-text"></i> EmailJS 연동 설정</h3>
          <button class="btn-close-modal" onclick="closeAdminModal('settingsModal')">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="publicKey">Public Key (User ID)</label>
            <input type="text" id="publicKey" class="form-input" value="${settings.publicKey || ''}" placeholder="예: user_ABcdEFgh1234">
          </div>
          <div class="form-group">
            <label class="form-label" for="serviceId">Service ID</label>
            <input type="text" id="serviceId" class="form-input" value="${settings.serviceId || ''}" placeholder="예: service_gmail">
          </div>
          <div class="form-group">
            <label class="form-label" for="templateId">Template ID</label>
            <input type="text" id="templateId" class="form-input" value="${settings.templateId || ''}" placeholder="예: template_notice">
          </div>
          <div class="form-group">
            <label class="form-label" for="adminEmail">알림 수신 이메일</label>
            <input type="email" id="adminEmail" class="form-input" value="${settings.adminEmail || 'admin@oamaster.co.kr'}" placeholder="예: admin@example.com">
            <p class="form-helper">게시글 작성/수정 알림 메일을 전송받을 목적지 이메일 주소입니다.</p>
          </div>
          <div class="form-helper" style="border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 15px;">
            ※ EmailJS 계정이 없으신 경우, <a href="https://www.emailjs.com" target="_blank" style="color:var(--theme-primary); text-decoration:underline;">emailjs.com</a>에서 무료 회원가입 후 템플릿과 키를 생성하십시오. 템플릿 변수는 <strong>{{action}}</strong>, <strong>{{title}}</strong>, <strong>{{message}}</strong>, <strong>{{date}}</strong>를 포함하여 구성하면 알림 메일이 예쁘게 전송됩니다.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeAdminModal('settingsModal')">취소</button>
          <button class="btn btn-primary" onclick="submitEmailSettings()">저장하기</button>
        </div>
      </div>
    </div>
  `;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHTML;
  document.body.appendChild(tempDiv.firstElementChild);
  
  setTimeout(() => {
    document.getElementById('settingsModal').classList.add('open');
  }, 50);
}

function submitEmailSettings() {
  const publicKey = document.getElementById('publicKey').value;
  const serviceId = document.getElementById('serviceId').value;
  const templateId = document.getElementById('templateId').value;
  const adminEmail = document.getElementById('adminEmail').value;
  
  window.DB.saveEmailJSSettings({
    publicKey,
    serviceId,
    templateId,
    adminEmail
  });
  
  showToast('EmailJS 설정이 안전하게 저장되었습니다.', 'success');
  closeAdminModal('settingsModal');
}

// Send Notification via EmailJS
function sendAdminEmailNotification(action, title, messageText) {
  const settings = window.DB.getEmailJSSettings();
  
  // If settings are not configured, warn in console but don't break flow
  if (!settings.publicKey || !settings.serviceId || !settings.templateId) {
    console.warn("EmailJS is not fully configured. Email notification skipped.");
    showToast("로컬 데이터는 저장되었으나, EmailJS 설정이 누락되어 이메일 알림은 발송되지 않았습니다.", "warning");
    return Promise.resolve(false);
  }
  
  // Load emailjs script if not loaded
  if (typeof emailjs === 'undefined') {
    console.error("EmailJS SDK is not loaded.");
    return Promise.resolve(false);
  }
  
  // Initialize emailjs
  emailjs.init(settings.publicKey);
  
  const templateParams = {
    action: action, // e.g. "신규 자료실 게시글 등록"
    title: title,   // e.g. "[요약본] 2026 컴활 1급 필기 요약"
    message: messageText, // e.g. "파일명: xxx.pdf, 크기: 4.8MB"
    to_email: settings.adminEmail,
    date: new Date().toLocaleString()
  };
  
  return emailjs.send(settings.serviceId, settings.templateId, templateParams)
    .then(response => {
      console.log('EmailJS Notification Sent SUCCESS!', response.status, response.text);
      showToast('변경 사항이 저장되었으며, EmailJS 이메일 알림이 발송되었습니다.', 'success');
      return true;
    }, error => {
      console.error('EmailJS Notification FAILED...', error);
      showToast('이메일 알림 발송 중 오류가 발생했습니다. (관리자 설정을 확인해 주세요)', 'error');
      return false;
    });
}

// Add Admin UI Trigger to header when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Ensure the Admin toggle button triggers action
  const adminBtn = document.getElementById('adminModeBtn');
  if (adminBtn) {
    adminBtn.onclick = toggleAdminMode;
  }
  
  // Update UI components for initial state
  updateAdminUI();
});

// Export functions to window scope
window.isAdmin = isAdmin;
window.updateAdminUI = updateAdminUI;
window.closeAdminModal = closeAdminModal;
window.sendAdminEmailNotification = sendAdminEmailNotification;
