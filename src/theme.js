import { store } from './store.js';

export function initTheme() {
  const saved = store.get('settings.theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a1a' : '#ffffff');
}

export function toggleTheme() {
  const current = store.get('settings.theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  store.set('settings.theme', next);
  document.documentElement.style.transition = 'background-color 0.3s, color 0.3s';
  applyTheme(next);
  setTimeout(() => { document.documentElement.style.transition = ''; }, 350);
  return next;
}

export function getTheme() {
  return store.get('settings.theme') || 'dark';
}
