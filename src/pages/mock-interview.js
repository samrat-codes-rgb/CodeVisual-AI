import { store } from '../store.js';
import { ai } from '../services/ai.js';
import { showToast } from '../components/toast.js';
import { gamification } from '../services/gamification.js';

function renderMarkdown(text) {
  return text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:#111113;border-radius:8px;padding:12px;overflow-x:auto;border:1px solid var(--border);"><code style="font-family:JetBrains Mono,Consolas,monospace;font-size:12px;color:#e2e8f0;">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-secondary);padding:1px 5px;border-radius:3px;font-size:0.9em;color:var(--accent);">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');
}

const TYPES = [
  { id: 'dsa', name: 'DSA Technical', desc: 'Data structures & algorithms coding round' },
  { id: 'behavioral', name: 'Behavioral', desc: 'STAR method, teamwork, conflict resolution' },
  { id: 'system-design', name: 'System Design', desc: 'Design scalable systems and architectures' },
];

export function render(container) {
  let phase = 'select', selectedType = null, messages = [], isTyping = false, startTime = null;

  function renderPage() {
    if (phase === 'select') renderSelect();
    else if (phase === 'interview') renderInterview();
    else renderResults();
  }

  function renderSelect() {
    container.innerHTML = `
      <div class="interview-page">
        <div class="page-header"><h1>Mock Interview</h1></div>
        <div class="card" style="margin-bottom:16px;">
          <p style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.6;">Practice with an AI interviewer. You'll get real-time feedback and follow-up questions.</p>
        </div>
        <div class="section-title">Select type</div>
        ${TYPES.map(t => `
          <div class="interview-type-card" data-type="${t.id}">
            <div class="interview-type-body"><h3>${t.name}</h3><p>${t.desc}</p></div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>`).join('')}
        <p style="margin-top:12px;font-size:11px;color:var(--text-muted);">Add your Gemini API key in settings for realistic responses.</p>
      </div>`;
    container.querySelectorAll('.interview-type-card').forEach(card => {
      card.addEventListener('click', () => { selectedType = card.dataset.type; phase = 'interview'; messages = []; startTime = Date.now(); renderPage(); setTimeout(startInterview, 200); });
    });
  }

  function renderInterview() {
    const typeInfo = TYPES.find(t => t.id === selectedType);
    container.innerHTML = `
      <div class="interview-active" style="display:flex;flex-direction:column;height:calc(100vh - 120px);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-shrink:0;">
          <span style="font-weight:600;font-size:var(--text-sm);color:var(--text-primary);">${typeInfo?.name || 'Interview'}</span>
          <button class="btn btn-ghost" id="btn-end" style="font-size:11px;padding:4px 10px;color:var(--error);">End</button>
        </div>
        <div id="interview-messages" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 0 12px;">
          ${messages.map(msg => `<div class="message-row ${msg.role === 'user' ? 'user' : 'ai'}">
            ${msg.role !== 'user' ? '<div class="ai-avatar" style="font-size:11px;">IV</div>' : ''}
            <div class="chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}">${renderMarkdown(msg.content)}</div>
          </div>`).join('')}
          ${isTyping ? '<div class="message-row ai"><div class="ai-avatar" style="font-size:11px;">IV</div><div class="chat-bubble chat-bubble-ai"><span class="typing-dot"></span><span class="typing-dot" style="animation-delay:.15s;"></span><span class="typing-dot" style="animation-delay:.3s;"></span></div></div>' : ''}
        </div>
        <div class="chat-input-bar" style="flex-shrink:0;">
          <textarea id="interview-input" placeholder="Your answer..." rows="2" style="flex:1;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-md);padding:9px 12px;color:var(--text-primary);font-family:Inter,sans-serif;font-size:var(--text-sm);resize:none;outline:none;max-height:100px;"></textarea>
          <button class="btn btn-primary" id="interview-send" style="padding:9px 14px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
        </div>
      </div>`;
    const input = container.querySelector('#interview-input'), sendBtn = container.querySelector('#interview-send');
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const t = input.value.trim(); if (t) { sendMsg(t); input.value = ''; } } });
    if (sendBtn) sendBtn.addEventListener('click', () => { const t = input?.value.trim(); if (t) { sendMsg(t); input.value = ''; } });
    container.querySelector('#btn-end')?.addEventListener('click', () => { gamification.addXP(300); gamification.checkBadges(); showToast('+300 XP', 'success'); phase = 'results'; renderPage(); });
    const el = container.querySelector('#interview-messages'); if (el) setTimeout(() => el.scrollTop = el.scrollHeight, 30);
  }

  function renderResults() {
    const elapsed = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0;
    const answered = messages.filter(m => m.role === 'user').length;
    container.innerHTML = `
      <div style="padding:32px 16px;text-align:center;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:4px;">Session complete</h2>
        <p style="color:var(--text-muted);margin-bottom:24px;font-size:var(--text-sm);">${answered} questions · ${elapsed}m · +300 XP</p>
        <button class="btn btn-primary" onclick="location.hash='interview'" style="width:100%;margin-bottom:8px;">Practice again</button>
        <button class="btn btn-secondary" onclick="location.hash='dashboard'" style="width:100%;">Dashboard</button>
      </div>`;
  }

  async function startInterview() {
    isTyping = true; renderPage();
    const openings = {
      dsa: "Let's start. Can you briefly describe your experience with data structures and algorithms? I'll then give you a problem.",
      behavioral: "Welcome. I'll ask about your experiences and how you handle challenges. First: tell me about yourself.",
      'system-design': "We'll design a system together. What's your experience level with system design?"
    };
    messages.push({ role: 'ai', content: openings[selectedType] || openings.dsa });
    isTyping = false; renderPage();
  }

  async function sendMsg(text) {
    if (!text.trim() || isTyping) return;
    messages.push({ role: 'user', content: text.trim() }); isTyping = true; renderPage();
    const apiKey = store.get('settings.apiKey'); if (apiKey) ai.setApiKey(apiKey);
    const user = store.get('user'); if (user) ai.setUserContext(user);
    try { const r = await ai.mockInterview(selectedType, messages.slice(-10)); messages.push({ role: 'ai', content: r }); }
    catch(e) { messages.push({ role: 'ai', content: 'Good answer. Let me think of a follow-up...' }); }
    isTyping = false; renderPage();
  }

  renderPage();
}
