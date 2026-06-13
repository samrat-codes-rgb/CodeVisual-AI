// ============================================
// ROUTER.JS — Hash-based SPA router
// ============================================

const ROUTES = {
  onboarding: { module: () => import('./pages/onboarding.js'), title: 'Welcome', hideNav: true },
  dashboard: { module: () => import('./pages/dashboard.js'), title: 'Dashboard', requiresOnboarding: true },
  roadmap: { module: () => import('./pages/roadmap.js'), title: 'Learning Roadmap', requiresOnboarding: true },
  problems: { module: () => import('./pages/problems.js'), title: 'Problems', requiresOnboarding: true },
  problem: { module: () => import('./pages/problem-detail.js'), title: 'Problem', requiresOnboarding: true },
  visualizer: { module: () => import('./pages/visualizer.js'), title: 'Visualizer', requiresOnboarding: true },
  learn: { module: () => import('./pages/learn.js'), title: 'Learn', requiresOnboarding: true },
  playground: { module: () => import('./pages/playground.js'), title: 'Playground', requiresOnboarding: true },
  tutor: { module: () => import('./pages/tutor.js'), title: 'AI Tutor', requiresOnboarding: true },
  interview: { module: () => import('./pages/mock-interview.js'), title: 'Mock Interview', requiresOnboarding: true },
  analytics: { module: () => import('./pages/analytics.js'), title: 'Analytics', requiresOnboarding: true },
  profile: { module: () => import('./pages/profile.js'), title: 'Profile', requiresOnboarding: true },
};

class Router {
  constructor() {
    this.currentRoute = null;
    this.currentParams = {};
    this.currentCleanup = null;
    this.container = null;
  }

  init() {
    this.container = document.getElementById('page-container');
    window.addEventListener('hashchange', () => this._handleHash());
    this._handleHash();
  }

  _handleHash() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const [routeName, ...paramParts] = hash.split('/');
    const params = {};
    for (let i = 0; i < paramParts.length; i += 2) {
      if (paramParts[i + 1]) params[paramParts[i]] = paramParts[i + 1];
    }
    this._load(routeName, params);
  }

  navigate(routeName, params = {}) {
    let hash = routeName;
    const paramStr = Object.entries(params).map(([k, v]) => `${k}/${v}`).join('/');
    if (paramStr) hash += '/' + paramStr;
    window.location.hash = hash;
  }

  async _load(routeName, params = {}) {
    const route = ROUTES[routeName];
    if (!route) { this.navigate('dashboard'); return; }

    // Cleanup previous page
    if (this.currentCleanup) {
      try { this.currentCleanup(); } catch(e) {}
      this.currentCleanup = null;
    }

    // Show/hide navbar
    const nav = document.getElementById('bottom-nav');
    if (nav) nav.style.display = route.hideNav ? 'none' : 'flex';

    // Page-container padding
    const container = this.container;
    if (!container) return;

    // Animate out
    container.style.opacity = '0';
    container.style.transform = 'translateY(8px)';

    try {
      const mod = await route.module();
      const render = mod.render || mod.default;

      document.title = `${route.title} | CodeVisual AI`;

      container.innerHTML = '';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
      container.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

      if (render) {
        const cleanup = render(container, params);
        if (typeof cleanup === 'function') this.currentCleanup = cleanup;
      }

      this.currentRoute = routeName;
      this.currentParams = params;

      // Update navbar active state
      this._updateNavActive(routeName);

      // Scroll to top
      container.scrollTop = 0;
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Router: Failed to load page:', routeName, err);
      container.innerHTML = `
        <div class="empty-state" style="padding: 3rem 2rem; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 1rem;">⚠️</div>
          <h2 style="color: var(--text-primary); margin-bottom: 0.5rem;">Page Load Error</h2>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${err.message}</p>
          <button class="btn btn-primary" onclick="location.hash='dashboard'">Go to Dashboard</button>
        </div>
      `;
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }
  }

  _updateNavActive(routeName) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.route === routeName);
    });
  }

  getCurrentRoute() { return this.currentRoute; }
  getCurrentParams() { return this.currentParams; }
}

export const router = new Router();
