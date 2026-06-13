import { store } from '../store.js';
import { ai } from '../services/ai.js';
import { speech } from '../services/speech.js';
import { showToast } from '../components/toast.js';
import { gamification } from '../services/gamification.js';

function renderMarkdown(text) {
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:#111113;border-radius:8px;padding:12px;overflow-x:auto;border:1px solid var(--border);margin:8px 0;"><code style="font-family:JetBrains Mono,Consolas,monospace;font-size:12px;color:#e2e8f0;">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-secondary);padding:1px 5px;border-radius:3px;font-size:0.9em;color:var(--accent);">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^#{3} (.+)$/gm, '<h4 style="color:var(--text-primary);margin:12px 0 6px;font-size:13px;">$1</h4>')
    .replace(/^#{2} (.+)$/gm, '<h3 style="color:var(--text-primary);margin:14px 0 6px;font-size:14px;">$1</h3>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0 3px 16px;font-size:13px;">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

const QUICK_PROMPTS = [
  'Explain Two Sum',
  'What is dynamic programming?',
  'DFS vs BFS',
  'What is Big O?',
  'Top interview patterns',
  'Binary search tree basics',
  'How does a hash map work?',
  'Study plan for placements',
];

export function render(container) {
  let messages = store.get('chat.history') || [];
  let isTyping = false;
  let speakingIdx = -1;

  function renderPage() {
    container.innerHTML = `
      <div class="tutor-page" style="display:flex;flex-direction:column;height:calc(100vh - 120px);min-height:400px;">
        <div class="page-header" style="flex-shrink:0;">
          <div>
            <h1 style="margin:0;">Tutor</h1>
            <div style="font-size:11px;color:var(--text-muted);">Ask anything about DSA</div>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-ghost" id="btn-clear" style="padding:6px;" title="Clear">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
            <button class="btn btn-ghost" id="btn-info" style="padding:6px;" title="API key">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          </div>
        </div>

        ${!store.get('settings.apiKey') ? `
        <div style="background:var(--warning-muted);border:1px solid rgba(217,119,6,0.2);border-radius:var(--radius-md);padding:8px 12px;margin-bottom:8px;flex-shrink:0;font-size:11px;color:var(--text-secondary);">
          No API key set — using demo responses. <a href="#profile" style="color:var(--accent);">Add key in settings →</a>
        </div>` : ''}

        <div id="messages-area" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 0 12px;">
          ${messages.length === 0 ? `
            <div style="text-align:center;padding:40px 16px;">
              <div style="width:48px;height:48px;border-radius:12px;background:var(--accent-muted);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 style="font-size:var(--text-lg);font-weight:600;color:var(--text-primary);margin-bottom:4px;">Ask me anything</h3>
              <p style="color:var(--text-muted);font-size:12px;max-width:260px;margin:0 auto;">Explain problems, review code, clarify concepts, or prepare for interviews.</p>
            </div>` : messages.map((msg, idx) => renderMessage(msg, idx)).join('')}
          ${isTyping ? `<div class="message-row ai"><div class="ai-avatar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div class="chat-bubble chat-bubble-ai" style="display:flex;gap:4px;padding:12px 16px;"><span class="typing-dot"></span><span class="typing-dot" style="animation-delay:.15s;"></span><span class="typing-dot" style="animation-delay:.3s;"></span></div></div>` : ''}
        </div>

        <div id="quick-prompts" style="display:flex;gap:4px;overflow-x:auto;padding:4px 0;flex-shrink:0;scrollbar-width:none;">
          ${QUICK_PROMPTS.map(p => `<button class="quick-prompt-btn" data-prompt="${p}">${p}</button>`).join('')}
        </div>

        <div class="chat-input-bar" style="flex-shrink:0;">
          <textarea id="chat-input" placeholder="Ask a question..." rows="1"
            style="flex:1;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-md);padding:9px 12px;color:var(--text-primary);font-family:Inter,sans-serif;font-size:var(--text-sm);resize:none;outline:none;max-height:80px;overflow-y:auto;transition:border-color .15s;"></textarea>
          <button class="btn btn-primary" id="send-btn" style="padding:9px 14px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    `;
    attachEvents(container);
    scrollToBottom();
  }

  function renderMessage(msg, idx) {
    const isUser = msg.role === 'user';
    const isSpeaking = speakingIdx === idx;
    return `
      <div class="message-row ${isUser ? 'user' : 'ai'}">
        ${!isUser ? `<div class="ai-avatar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>` : ''}
        <div>
          <div class="chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}">
            ${isUser ? escHtml(msg.content) : renderMarkdown(msg.content)}
          </div>
          ${!isUser && speech.supported ? `
            <button class="speak-msg-btn" data-idx="${idx}" style="background:none;border:none;cursor:pointer;padding:2px 6px;margin-top:2px;display:flex;align-items:center;gap:3px;font-size:10px;color:${isSpeaking ? 'var(--accent)' : 'var(--text-muted)'};font-family:inherit;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="${isSpeaking ? 'var(--accent)' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
              ${isSpeaking ? 'Stop' : 'Listen'}
            </button>` : ''}
        </div>
      </div>`;
  }

  async function sendMessage(text) {
    if (!text.trim() || isTyping) return;
    messages.push({ role: 'user', content: text.trim() });
    isTyping = true;
    renderPage();
    const apiKey = store.get('settings.apiKey');
    if (apiKey) ai.setApiKey(apiKey);
    const user = store.get('user');
    if (user) ai.setUserContext(user);
    try {
      const response = await ai.tutorChat(messages.slice(-10));
      messages.push({ role: 'ai', content: response });
      store.set('chat.history', messages.slice(-50));
      store.update('progress.aiQuestionsAsked', n => (n || 0) + 1);
      gamification.checkBadges();
    } catch (e) {
      messages.push({ role: 'ai', content: 'Something went wrong. Please try again.' });
    }
    isTyping = false;
    renderPage();
  }

  function attachEvents(container) {
    const input = container.querySelector('#chat-input');
    const sendBtn = container.querySelector('#send-btn');
    if (input) {
      input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 80) + 'px'; });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const t = input.value.trim(); if (t) { sendMessage(t); input.value = ''; input.style.height = 'auto'; } } });
      setTimeout(() => input.focus(), 200);
    }
    if (sendBtn) sendBtn.addEventListener('click', () => { if (!input) return; const t = input.value.trim(); if (t) { sendMessage(t); input.value = ''; input.style.height = 'auto'; } });
    container.querySelectorAll('.quick-prompt-btn').forEach(btn => { btn.addEventListener('click', () => sendMessage(btn.dataset.prompt)); });
    // TTS: speak AI messages
    container.querySelectorAll('.speak-msg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        if (speakingIdx === idx) { speech.stop(); speakingIdx = -1; renderPage(); return; }
        speech.stop(); speakingIdx = idx; renderPage();
        const msg = messages[idx];
        if (msg) speech.speak(msg.content).then(() => { speakingIdx = -1; renderPage(); }).catch(() => { speakingIdx = -1; renderPage(); });
      });
    });
    container.querySelector('#btn-clear')?.addEventListener('click', () => { if (!messages.length) return; messages = []; store.set('chat.history', []); renderPage(); showToast('Chat cleared', 'info'); });
    container.querySelector('#btn-info')?.addEventListener('click', () => {
      const key = store.get('settings.apiKey');
      const newKey = prompt(`Gemini API Key:\n\nGet a free key at: https://aistudio.google.com/apikey\n\nCurrent: ${key ? '••••' + key.slice(-4) : 'Not set'}`, key || '');
      if (newKey !== null) { store.set('settings.apiKey', newKey.trim()); ai.setApiKey(newKey.trim()); showToast(newKey.trim() ? 'API key saved' : 'API key cleared', 'success'); renderPage(); }
    });
  }

  function scrollToBottom() { const a = container.querySelector('#messages-area'); if (a) setTimeout(() => { a.scrollTop = a.scrollHeight; }, 30); }
  function escHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  renderPage();
}
