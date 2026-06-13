let currentModal = null;

export function showModal({ title, content, buttons = [], onClose }) {
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: var(--z-modal); padding: 1rem;
    animation: fadeIn 0.2s ease;
  `;

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = `
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius-xl); padding: 1.5rem;
    width: 100%; max-width: 480px; max-height: 85vh;
    overflow-y: auto; box-shadow: var(--shadow-lg);
    animation: scaleIn 0.25s ease;
  `;

  const buttonsHTML = buttons.length ? `
    <div class="modal-footer" style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border);">
      ${buttons.map((b, i) => `<button class="btn ${b.class || 'btn-secondary'}" data-btn-idx="${i}">${b.text}</button>`).join('')}
    </div>
  ` : '';

  modal.innerHTML = `
    <div class="modal-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
      <h3 style="font-size: var(--text-lg); font-weight: 700; margin: 0; color: var(--text-primary);">${title}</h3>
      <button class="modal-close-btn" style="background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 22px; padding: 0; line-height: 1;">×</button>
    </div>
    <div class="modal-body" style="color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.6;">${content}</div>
    ${buttonsHTML}
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  currentModal = overlay;

  // Event listeners
  modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', handleEsc);

  buttons.forEach((btn, i) => {
    const el = modal.querySelector(`[data-btn-idx="${i}"]`);
    if (el && btn.onClick) el.addEventListener('click', () => { btn.onClick(); closeModal(); });
  });

  if (onClose) overlay._onClose = onClose;

  return overlay;
}

export function closeModal() {
  if (currentModal) {
    if (currentModal._onClose) currentModal._onClose();
    currentModal.style.animation = 'fadeOut 0.2s ease forwards';
    setTimeout(() => { if (currentModal) { currentModal.remove(); currentModal = null; } }, 200);
    document.removeEventListener('keydown', handleEsc);
  }
}

function handleEsc(e) { if (e.key === 'Escape') closeModal(); }
