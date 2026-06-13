import { store } from '../store.js';
import { router } from '../router.js';
import { gamification } from '../services/gamification.js';
import { problemService } from '../services/problems.js';

export function render(container) {
  gamification.updateStreak();
  const stats = gamification.getStats();
  const user = store.get('user') || {};
  const progress = store.get('progress') || {};
  const solved = progress.solved || [];
  const name = user.name || 'there';
  const streak = stats.streak || 0;
  const level = stats.level || 1;
  const totalXP = stats.totalXP || 0;
  const recentLinks = store.get('recentLinks') || [];

  container.innerHTML = `
    <div class="dashboard-page">
      <!-- Greeting -->
      <div style="margin-bottom:20px;">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">Good ${getGreeting()}</div>
        <h1 style="font-size:1.25rem;font-weight:700;margin:0;">${name}</h1>
      </div>

      <!-- MAIN ACTION: Paste a link -->
      <div class="card" style="margin-bottom:16px;border-color:var(--accent-border);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <span style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);">Paste a problem link</span>
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">Drop a LeetCode or GeeksforGeeks URL and get an AI-powered explanation with step-by-step walkthrough.</p>
        <div style="display:flex;gap:6px;">
          <input class="input" id="url-input" placeholder="https://leetcode.com/problems/two-sum/" style="flex:1;font-size:var(--text-sm);" />
          <button class="btn btn-primary" id="url-go" style="padding:8px 16px;white-space:nowrap;">Explain</button>
        </div>
        <div id="url-error" style="margin-top:6px;font-size:11px;color:var(--error);display:none;"></div>
      </div>

      <!-- Quick stats -->
      <div style="display:flex;gap:8px;margin-bottom:16px;">
        <div style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:10px;text-align:center;">
          <div style="font-size:1.125rem;font-weight:700;">${solved.length}</div>
          <div style="font-size:10px;color:var(--text-muted);">Solved</div>
        </div>
        <div style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:10px;text-align:center;">
          <div style="font-size:1.125rem;font-weight:700;">${streak}d</div>
          <div style="font-size:10px;color:var(--text-muted);">Streak</div>
        </div>
        <div style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:10px;text-align:center;">
          <div style="font-size:1.125rem;font-weight:700;">Lv.${level}</div>
          <div style="font-size:10px;color:var(--text-muted);">${totalXP} XP</div>
        </div>
      </div>

      <!-- Recent links -->
      ${recentLinks.length > 0 ? `
      <div class="section-title">Recent</div>
      <div style="margin-bottom:16px;">
        ${recentLinks.slice(0, 5).map(link => `
          <div class="problem-card recent-link-card" data-url="${escAttr(link.url)}" data-slug="${escAttr(link.slug)}">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--accent);flex-shrink:0;"></div>
            <div class="problem-info">
              <div class="problem-title">${link.title}</div>
              <div style="font-size:10px;color:var(--text-muted);">${link.source} · ${link.time}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>`).join('')}
      </div>` : ''}

      <!-- Or try these -->
      <div class="section-title">Try a problem</div>
      <div style="margin-bottom:16px;">
        ${problemService.getAll().slice(0, 5).map(p => `
          <div class="problem-card db-problem" data-id="${p.id}">
            <div class="problem-status ${solved.includes(p.id) ? 'solved' : 'unsolved'}"></div>
            <div class="problem-info">
              <div class="problem-title">${p.number ? `${p.number}. ` : ''}${p.title}</div>
              <div class="problem-meta">
                <span class="badge badge-${p.difficulty}">${p.difficulty}</span>
                ${p.topics.slice(0, 2).map(t => `<span class="topic-tag">${t}</span>`).join('')}
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>`).join('')}
        <button class="btn btn-secondary" style="width:100%;margin-top:6px;" onclick="location.hash='problems'">All problems</button>
      </div>

      <!-- Quick links -->
      <div class="section-title">Quick actions</div>
      <div class="quick-actions" style="margin-bottom:20px;">
        <button class="quick-action-btn" onclick="location.hash='tutor'"><span class="qa-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span><span class="qa-label">AI Tutor</span></button>
        <button class="quick-action-btn" onclick="location.hash='visualizer'"><span class="qa-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></span><span class="qa-label">Visualize</span></button>
        <button class="quick-action-btn" onclick="location.hash='playground'"><span class="qa-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span><span class="qa-label">Playground</span></button>
        <button class="quick-action-btn" onclick="location.hash='interview'"><span class="qa-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></span><span class="qa-label">Interview</span></button>
      </div>
    </div>
  `;

  // --- Events ---

  // URL paste & explain
  const urlInput = container.querySelector('#url-input');
  const urlGo = container.querySelector('#url-go');
  const urlError = container.querySelector('#url-error');

  function handleUrl() {
    const url = urlInput?.value.trim();
    if (!url) { urlError.textContent = 'Paste a URL first.'; urlError.style.display = 'block'; return; }
    urlError.style.display = 'none';

    // Parse the URL
    const parsed = parseUrl(url);
    if (!parsed) { urlError.textContent = 'Please paste a valid LeetCode or GeeksforGeeks problem URL.'; urlError.style.display = 'block'; return; }

    // Check if we have it in DB
    const dbProblem = problemService.getById(parsed.slug);

    // Save to recent links
    const recents = store.get('recentLinks') || [];
    const newEntry = { url, slug: parsed.slug, title: parsed.title, source: parsed.source, time: new Date().toLocaleDateString() };
    const updated = [newEntry, ...recents.filter(r => r.slug !== parsed.slug)].slice(0, 10);
    store.set('recentLinks', updated);

    // Navigate to learn page
    if (dbProblem) {
      router.navigate('learn', { id: dbProblem.id });
    } else {
      router.navigate('learn', { url: encodeURIComponent(url), slug: encodeURIComponent(parsed.slug) });
    }
  }

  if (urlGo) urlGo.addEventListener('click', handleUrl);
  if (urlInput) {
    urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleUrl(); });
    // Auto-detect paste
    urlInput.addEventListener('paste', () => { setTimeout(() => { if (urlInput.value.trim()) handleUrl(); }, 100); });
    // Focus the input
    setTimeout(() => urlInput.focus(), 300);
  }

  // DB problem cards
  container.querySelectorAll('.db-problem').forEach(card => {
    card.addEventListener('click', () => router.navigate('learn', { id: card.dataset.id }));
  });

  // Recent link cards
  container.querySelectorAll('.recent-link-card').forEach(card => {
    card.addEventListener('click', () => {
      const slug = card.dataset.slug;
      const url = card.dataset.url;
      const dbProblem = problemService.getById(slug);
      if (dbProblem) router.navigate('learn', { id: dbProblem.id });
      else router.navigate('learn', { url: encodeURIComponent(url), slug: encodeURIComponent(slug) });
    });
  });
}

function parseUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('leetcode.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('problems');
      if (idx !== -1 && parts[idx + 1]) {
        const slug = parts[idx + 1];
        return { slug, title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), source: 'LeetCode' };
      }
    }
    if (parsed.hostname.includes('geeksforgeeks.org')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('problems');
      if (idx !== -1 && parts[idx + 1]) {
        const slug = parts[idx + 1];
        return { slug, title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), source: 'GeeksforGeeks' };
      }
      const slug = parts[parts.length - 1] || null;
      if (slug) return { slug, title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), source: 'GeeksforGeeks' };
    }
  } catch (e) {}
  return null;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function escAttr(s) { return (s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
