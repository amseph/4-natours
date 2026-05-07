/* ============================================
   Shared Utilities — Toast, Auth, Navbar
   ============================================ */

// --- Toast Notifications ---
function showToast(message, type = 'info', duration = 3500) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('toast--visible');
  });

  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// --- Auth Helpers ---
function getToken() {
  // Try cookie first (httpOnly cookies are sent automatically, but we also check
  // for a localStorage fallback for the frontend display state)
  return localStorage.getItem('jwt') || '';
}

function isLoggedIn() {
  return !!localStorage.getItem('jwt');
}

function getUserName() {
  return localStorage.getItem('userName') || '';
}

async function logout() {
  try {
    const res = await fetch('/api/v1/users/logout');
    const data = await res.json();
    if (data.status === 'success') {
      localStorage.removeItem('jwt');
      localStorage.removeItem('userName');
      showToast('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }
  } catch (err) {
    // Fallback if server is down
    localStorage.removeItem('jwt');
    localStorage.removeItem('userName');
    window.location.href = '/';
  }
}

// --- Auth Fetch Wrapper ---
async function authFetch(url, options = {}) {
  const token = getToken();
  if (token) {
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, options);
}

// --- Build Navbar ---
function renderNavbar(activePage) {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  const loggedIn = isLoggedIn();
  const userName = getUserName();
  const initial = userName ? userName.charAt(0).toUpperCase() : '?';

  let rightLinks = '';
  if (loggedIn) {
    rightLinks = `
      <div class="navbar__user">
        <div class="navbar__avatar">${initial}</div>
        <span>${userName}</span>
      </div>
      <a href="#" class="navbar__link navbar__link--danger" onclick="logout(); return false;">Logout</a>
    `;
  } else {
    rightLinks = `
      <a href="/login" class="navbar__link ${activePage === 'login' ? 'navbar__link--active' : ''}">Log In</a>
      <a href="/signup" class="navbar__link navbar__link--cta">Sign Up</a>
    `;
  }

  nav.innerHTML = `
    <a href="/" class="navbar__brand">
      <i data-lucide="shopping-bag" class="navbar__brand-icon"></i>
      Marketplace
    </a>
    <ul class="navbar__links">
      <li><a href="/" class="navbar__link ${activePage === 'home' ? 'navbar__link--active' : ''}">Home</a></li>
      <li><a href="/overview" class="navbar__link ${activePage === 'overview' ? 'navbar__link--active' : ''}">Products</a></li>
      ${loggedIn ? `<li><a href="/add-item" class="navbar__link ${activePage === 'add-item' ? 'navbar__link--active' : ''}">Sell Item</a></li>` : ''}
      <li><a href="/stats" class="navbar__link ${activePage === 'stats' ? 'navbar__link--active' : ''}">Stats</a></li>
      ${rightLinks}
    </ul>
  `;

  document.body.prepend(nav);
  // Initialize Lucide
  if (window.lucide) lucide.createIcons();
}

// --- Category Helper ---
function getCategoryIcon(category) {
  if (!category || typeof category !== 'string') return 'package';
  const cat = category.toLowerCase();
  if (cat.includes('elect') || cat.includes('phone') || cat.includes('tech')) return 'cpu';
  if (cat.includes('furn') || cat.includes('home')) return 'home';
  if (cat.includes('cloth') || cat.includes('fash') || cat.includes('wear')) return 'shirt';
  if (cat.includes('food') || cat.includes('drink')) return 'utensils';
  if (cat.includes('car') || cat.includes('auto') || cat.includes('bike')) return 'car';
  if (cat.includes('book') || cat.includes('educ')) return 'book-open';
  if (cat.includes('sport') || cat.includes('fit')) return 'activity';
  return 'package';
}

// --- Ghost Loader Template ---
const GHOST_HTML = `
<div class="ghost-loader-container">
  <div id="ghost">
    <div id="red">
      <div id="top0"></div><div id="top1"></div><div id="top2"></div><div id="top3"></div><div id="top4"></div>
      <div id="st0"></div><div id="st1"></div><div id="st2"></div><div id="st3"></div><div id="st4"></div><div id="st5"></div>
      <div id="an1"></div><div id="an2"></div><div id="an3"></div><div id="an4"></div><div id="an5"></div><div id="an6"></div>
      <div id="an7"></div><div id="an8"></div><div id="an9"></div><div id="an10"></div><div id="an11"></div><div id="an12"></div>
      <div id="an13"></div><div id="an14"></div><div id="an15"></div><div id="an16"></div><div id="an17"></div><div id="an18"></div>
    </div>
    <div id="eye"></div>
    <div id="pupil"></div>
    <div id="eye1"></div>
    <div id="pupil1"></div>
    <div id="shadow"></div>
  </div>
  <p style="margin-top: 4rem; color: var(--text-sub); font-weight: 600; letter-spacing: 1px;">LOADING DATA...</p>
</div>
`;
