import { router } from '../router.js';

const NAV_ITEMS = [
  {
    route: 'dashboard',
    label: 'Home',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>`
  },
  {
    route: 'problems',
    label: 'Problems',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>`
  },
  {
    route: 'visualizer',
    label: 'Visualizer',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>`
  },
  {
    route: 'tutor',
    label: 'AI Tutor',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`
  },
  {
    route: 'profile',
    label: 'Profile',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>`
  }
];

export function renderNavbar(container) {
  container.className = 'bottom-nav';
  container.innerHTML = `
    <div class="nav-brand-desktop" style="display:none;align-items:center;gap:10px;padding:0 12px;margin-bottom:32px;width:100%;">
      <div style="width:32px;height:32px;border-radius:8px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;font-weight:800;font-family:inherit;">C</div>
      <span style="font-weight:800;font-size:15px;color:var(--text-primary);letter-spacing:-0.5px;font-family:inherit;">CodeVisual AI</span>
    </div>
    <div class="nav-items-wrapper" style="display:flex;flex:1;width:100%;flex-direction:inherit;justify-content:inherit;align-items:inherit;gap:inherit;">
      ${NAV_ITEMS.map(item => `
        <button class="nav-item" data-route="${item.route}" aria-label="${item.label}">
          ${item.icon}
          <span>${item.label}</span>
        </button>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      router.navigate(btn.dataset.route);
    });
  });

  // Sync active state on hash change
  window.addEventListener('hashchange', () => updateActive(container));
  updateActive(container);
}

function updateActive(container) {
  const hash = window.location.hash.slice(1).split('/')[0] || 'dashboard';
  container.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.route === hash);
  });
}
