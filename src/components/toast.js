let toastContainer = null;

export function initToast() {
  toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

export function showToast(message, type = 'info', duration = 3000) {
  if (!toastContainer) initToast();

  const toast = document.createElement('div');
  toast.innerHTML = `
    <span style="flex:1;font-size:13px;color:var(--text-primary);">${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:16px;padding:0;line-height:1;">×</button>
  `;

  const colors = { success: 'var(--success)', error: 'var(--error)', warning: 'var(--warning)', info: 'var(--accent)' };
  toast.style.cssText = `
    display: flex; align-items: center; gap: 10px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius-md); padding: 10px 14px;
    box-shadow: var(--shadow-lg);
    animation: fadeIn 0.15s ease;
    border-left: 3px solid ${colors[type] || colors.info};
    max-width: 320px; width: 100%;
  `;

  toastContainer.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.2s';
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }

  return toast;
}
