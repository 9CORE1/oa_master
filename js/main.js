// --- Main UI & Common Interactions Module ---

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeaderScroll();
  initMobileNav();
  initToastContainer();
});

// 1. Initialize theme based on body class or current page name
function initTheme() {
  const path = window.location.pathname;
  const body = document.body;
  
  if (path.includes('written_')) {
    body.className = 'theme-written';
  } else if (path.includes('practical_')) {
    body.className = 'theme-practical';
  } else if (path.includes('recommendations')) {
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

// Export functions to window scope
window.showToast = showToast;
