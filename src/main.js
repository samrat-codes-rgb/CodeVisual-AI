import { router } from './router.js';
import { store } from './store.js';
import { initTheme } from './theme.js';
import { renderNavbar } from './components/navbar.js';
import { initToast } from './components/toast.js';

function initApp() {
  // Apply theme first to avoid flash
  initTheme();
  initToast();

  const app = document.getElementById('app');
  app.innerHTML = `
    <main id="page-container" class="page-container"></main>
    <nav id="bottom-nav" class="bottom-nav"></nav>
    <div id="toast-container" class="toast-container"></div>
    <div id="modal-container"></div>
  `;

  renderNavbar(document.getElementById('bottom-nav'));

  // Initialize router (handles hash routing)
  router.init();

  // Navigate to correct initial page
  const user = store.get('user');
  const hash = window.location.hash.slice(1);

  if (!hash || hash === '') {
    if (!user || !user.onboarded) {
      router.navigate('onboarding');
    } else {
      router.navigate('dashboard');
    }
  }
}

document.addEventListener('DOMContentLoaded', initApp);
