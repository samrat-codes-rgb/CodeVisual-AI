import { problemService } from '../services/problems.js';
import { store } from '../store.js';
import { ai } from '../services/ai.js';
import { gamification } from '../services/gamification.js';
import { showToast } from '../components/toast.js';

function renderMarkdown(text) {
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:#111113;border-radius:8px;padding:12px;overflow-x:auto;border:1px solid var(--border);margin:8px 0;"><code style="font-family:JetBrains Mono,Consolas,monospace;font-size:12px;color:#e2e8f0;">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-secondary);padding:1px 5px;border-radius:3px;font-size:0.9em;color:var(--accent);">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^#{3} (.+)$/gm, '<h4 style="color:var(--text-primary);margin:12px 0 6px;font-size:13px;">$1</h4>')
    .replace(/^#{2} (.+)$/gm, '<h3 style="color:var(--text-primary);margin:14px 0 6px;font-size:14px;">$1</h3>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0 3px 16px;">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export function render(container, params) {
  const problemId = params?.id;
  const problem = problemId ? problemService.getById(problemId) : null;

  if (!problem) {
    container.innerHTML = `<div style="padding:32px;text-align:center;"><p style="color:var(--text-muted);">Problem not found.</p><button class="btn btn-secondary" onclick="location.hash='problems'" style="margin-top:12px;">Back</button></div>`;
    return;
  }

  const solved = store.get('progress.solved') || [];
  const isSolved = solved.includes(problem.id);
  let activeApproach = 'optimal';
  let activeLang = store.get('settings.language') || 'python';
  let isLoadingAI = false;

  function renderPage() {
    const solution = problem.solutions?.[activeLang];
    const code = solution?.[activeApproach] || '// No solution available';
    const complexity = problem.complexity?.[activeApproach] || {};

    container.innerHTML = `
      <div class="problem-detail-page">
        <button onclick="location.hash='problems'" style="background:none;border:none;color:var(--text-muted);font-size:var(--text-sm);cursor:pointer;display:flex;align-items:center;gap:4px;padding:0;margin-bottom:12px;font-family:inherit;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Back
        </button>

        <div class="problem-detail-header">
          <h1>${problem.number ? `${problem.number}. ` : ''}${problem.title}</h1>
          <div class="problem-meta-row">
            <span class="badge badge-${problem.difficulty}">${problem.difficulty}</span>
            <span style="font-size:11px;color:var(--text-muted);">${problem.source?.toUpperCase()||'LeetCode'}</span>
            ${problem.topics.map(t => `<span class="chip">${t}</span>`).join('')}
            ${isSolved ? '<span style="color:var(--success);font-weight:600;font-size:var(--text-xs);">Solved</span>' : ''}
          </div>
        </div>

        ${problem.companies?.length ? `<div style="margin-bottom:10px;display:flex;gap:4px;flex-wrap:wrap;align-items:center;">
          <span style="font-size:11px;color:var(--text-muted);">Asked by</span>
          ${problem.companies.map(c => `<span style="font-size:11px;background:var(--bg-secondary);padding:1px 6px;border-radius:4px;color:var(--text-muted);">${c}</span>`).join('')}
        </div>` : ''}

        <div class="card" style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">PROBLEM</div>
          <p style="color:var(--text-secondary);line-height:1.7;font-size:var(--text-sm);">${problem.description}</p>
        </div>

        ${problem.examples?.length ? `<div class="card" style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">EXAMPLES</div>
          ${problem.examples.map((ex, i) => `
            <div style="margin-bottom:8px;padding:10px;background:var(--bg-secondary);border-radius:var(--radius-md);font-family:monospace;font-size:12px;">
              <div><span style="color:var(--text-muted);">Input:</span> <code>${ex.input}</code></div>
              <div><span style="color:var(--text-muted);">Output:</span> <code>${ex.output}</code></div>
              ${ex.explanation ? `<div style="margin-top:4px;color:var(--text-muted);font-family:Inter,sans-serif;font-size:11px;">${ex.explanation}</div>` : ''}
            </div>`).join('')}
        </div>` : ''}

        <div class="card" style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">SOLUTION</div>
          <div class="tab-bar" style="margin-bottom:8px;" id="approach-tabs">
            <div class="tab-item ${activeApproach === 'brute' ? 'active' : ''}" data-approach="brute">Brute Force</div>
            <div class="tab-item ${activeApproach === 'optimal' ? 'active' : ''}" data-approach="optimal">Optimal</div>
          </div>
          <div class="lang-tabs" id="lang-tabs">
            ${['python','javascript','java','cpp'].map(lang => `<div class="lang-tab ${activeLang === lang ? 'active' : ''}" data-lang="${lang}">${{ python:'Python', javascript:'JS', java:'Java', cpp:'C++' }[lang]}</div>`).join('')}
          </div>
          <div class="code-block" style="position:relative;">
            <button id="copy-btn" style="position:absolute;top:8px;right:8px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;padding:2px 8px;font-size:10px;cursor:pointer;color:var(--text-muted);">Copy</button>
            <pre style="margin:0;white-space:pre-wrap;font-size:12px;line-height:1.6;padding-right:50px;color:#e2e8f0;">${escHtml(code)}</pre>
          </div>
          <div class="complexity-cards">
            <div class="complexity-card"><div class="complexity-type">Time</div><div class="complexity-value">${complexity.time || '—'}</div></div>
            <div class="complexity-card"><div class="complexity-type">Space</div><div class="complexity-value">${complexity.space || '—'}</div></div>
          </div>
        </div>

        ${problem.hints?.length ? `<div class="card" style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">HINTS</div>
          ${problem.hints.map((hint, i) => `
            <button class="btn btn-ghost hint-toggle" data-idx="${i}" style="width:100%;text-align:left;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-md);font-size:var(--text-sm);margin-bottom:4px;">Hint ${i+1}</button>
            <div class="hint-content" data-idx="${i}" style="display:none;padding:8px 12px;background:var(--accent-muted);border:1px solid var(--accent-border);border-radius:var(--radius-md);margin-bottom:6px;font-size:12px;color:var(--text-secondary);">${hint}</div>`).join('')}
        </div>` : ''}

        <div class="card" style="margin-bottom:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <div style="font-size:11px;font-weight:600;color:var(--text-muted);">AI EXPLANATION</div>
            <button class="btn btn-secondary" id="btn-explain" style="padding:5px 12px;font-size:11px;">Generate</button>
          </div>
          <div id="ai-content" style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.6;">
            <p style="color:var(--text-muted);font-size:12px;">Click Generate for a detailed breakdown.</p>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:24px;">
          <button class="btn ${isSolved ? 'btn-secondary' : 'btn-primary'}" id="btn-solved" style="flex:1;">
            ${isSolved ? 'Mark unsolved' : 'Mark solved'}
          </button>
          <button class="btn btn-secondary" onclick="location.hash='playground'" style="padding:8px 14px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </button>
        </div>

        ${renderRelated(problem)}
      </div>
    `;

    attachEvents(container, problem);
  }

  function renderRelated(problem) {
    const related = problemService.getRelatedProblems(problem.id);
    if (!related.length) return '';
    return `<div class="section-title">Related</div>
      ${related.slice(0,3).map(p => `
        <div class="problem-card" onclick="location.hash='problem/id/${p.id}'">
          <div class="problem-status ${solved.includes(p.id) ? 'solved' : 'unsolved'}"></div>
          <div class="problem-info"><div class="problem-title">${p.title}</div><div class="problem-meta"><span class="badge badge-${p.difficulty}">${p.difficulty}</span></div></div>
        </div>`).join('')}`;
  }

  function attachEvents(container, problem) {
    container.querySelectorAll('[data-approach]').forEach(t => t.addEventListener('click', () => { activeApproach = t.dataset.approach; renderPage(); }));
    container.querySelectorAll('[data-lang]').forEach(t => t.addEventListener('click', () => { activeLang = t.dataset.lang; store.set('settings.language', activeLang); renderPage(); }));
    container.querySelector('#copy-btn')?.addEventListener('click', () => { navigator.clipboard.writeText(problem.solutions?.[activeLang]?.[activeApproach]||'').then(() => { container.querySelector('#copy-btn').textContent = 'Copied'; setTimeout(() => { const b = container.querySelector('#copy-btn'); if(b) b.textContent = 'Copy'; }, 1500); }); });
    container.querySelectorAll('.hint-toggle').forEach(btn => { btn.addEventListener('click', () => { const c = container.querySelector(`.hint-content[data-idx="${btn.dataset.idx}"]`); if(c) c.style.display = c.style.display==='none' ? 'block' : 'none'; }); });
    const btnExplain = container.querySelector('#btn-explain'), aiContent = container.querySelector('#ai-content');
    if (btnExplain && aiContent) {
      btnExplain.addEventListener('click', async () => {
        if (isLoadingAI) return; isLoadingAI = true;
        btnExplain.textContent = 'Generating...'; btnExplain.disabled = true;
        aiContent.innerHTML = '<div class="skeleton" style="height:120px;"></div>';
        const apiKey = store.get('settings.apiKey'); if (apiKey) ai.setApiKey(apiKey);
        const user = store.get('user'); if (user) ai.setUserContext(user);
        try { const r = await ai.explainProblem(problem); aiContent.innerHTML = renderMarkdown(r); store.update('progress.aiQuestionsAsked', n => (n||0)+1); }
        catch(e) { aiContent.innerHTML = '<p style="color:var(--error);">Failed. Try again.</p>'; }
        isLoadingAI = false; btnExplain.textContent = 'Regenerate'; btnExplain.disabled = false;
      });
    }
    container.querySelector('#btn-solved')?.addEventListener('click', () => {
      const s = store.get('progress.solved') || [];
      if (s.includes(problem.id)) { store.set('progress.solved', s.filter(id => id !== problem.id)); showToast('Marked unsolved', 'info'); }
      else { const r = gamification.onProblemSolved(problem); showToast(`+${r.xpGain} XP`, 'success'); if (r.leveledUp) showToast(`Level ${r.newLevel}`, 'success'); }
      renderPage();
    });
  }

  function escHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  renderPage();
}
