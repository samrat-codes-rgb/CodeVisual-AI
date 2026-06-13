import { problemService } from '../services/problems.js';
import { store } from '../store.js';
import { router } from '../router.js';
import { showToast } from '../components/toast.js';

export function render(container) {
  const solved = store.get('progress.solved') || [];
  let filters = { topic: 'all', difficulty: 'all', query: '' };

  function getFiltered() {
    return problemService.filter({ topic: filters.topic, difficulty: filters.difficulty, query: filters.query, solvedIds: solved });
  }

  function renderPage() {
    const problems = getFiltered();
    const topics = problemService.getTopics();

    container.innerHTML = `
      <div class="problems-page">
        <div class="page-header">
          <h1>Problems</h1>
          <span style="font-size:11px;color:var(--text-muted);">${solved.length} solved</span>
        </div>

        <div class="url-input-section">
          <h3>Import from URL</h3>
          <div class="url-input-row">
            <input class="input" id="url-input" placeholder="Paste LeetCode or GFG link..." style="font-size:var(--text-sm);" />
            <button class="btn btn-primary" id="url-btn" style="padding:8px 14px;">Import</button>
          </div>
        </div>

        <div class="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="search-input" placeholder="Search problems, topics..." value="${filters.query}" />
        </div>

        <div class="filters-row">
          <div class="filter-chip ${filters.difficulty === 'all' ? 'active' : ''}" data-type="difficulty" data-val="all">All</div>
          <div class="filter-chip ${filters.difficulty === 'easy' ? 'active' : ''}" data-type="difficulty" data-val="easy">Easy</div>
          <div class="filter-chip ${filters.difficulty === 'medium' ? 'active' : ''}" data-type="difficulty" data-val="medium">Medium</div>
          <div class="filter-chip ${filters.difficulty === 'hard' ? 'active' : ''}" data-type="difficulty" data-val="hard">Hard</div>
          ${topics.map(t => `<div class="filter-chip ${filters.topic === t.id ? 'active' : ''}" data-type="topic" data-val="${t.id}">${t.name}</div>`).join('')}
        </div>

        <div style="display:flex;gap:6px;margin-bottom:12px;">
          ${[
            { label: 'Easy', count: problems.filter(p=>p.difficulty==='easy').length, color: 'var(--success)' },
            { label: 'Medium', count: problems.filter(p=>p.difficulty==='medium').length, color: 'var(--warning)' },
            { label: 'Hard', count: problems.filter(p=>p.difficulty==='hard').length, color: 'var(--error)' },
          ].map(d => `<div style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:8px;text-align:center;">
            <div style="font-weight:700;color:${d.color};">${d.count}</div>
            <div style="font-size:10px;color:var(--text-muted);">${d.label}</div>
          </div>`).join('')}
          <div style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:8px;text-align:center;">
            <div style="font-weight:700;color:var(--text-primary);">${problems.length}</div>
            <div style="font-size:10px;color:var(--text-muted);">Total</div>
          </div>
        </div>

        <div id="problem-list">
          ${problems.length ? problems.map(p => {
            const status = solved.includes(p.id) ? 'solved' : 'unsolved';
            return `
              <div class="problem-card" data-id="${p.id}">
                <div class="problem-status ${status}"></div>
                <div class="problem-info">
                  <div class="problem-title">${p.number ? `${p.number}. ` : ''}${p.title}</div>
                  <div class="problem-meta">
                    <span class="badge badge-${p.difficulty}">${p.difficulty}</span>
                    ${p.topics.slice(0,2).map(t => `<span class="topic-tag">${t}</span>`).join('')}
                  </div>
                </div>
                ${status === 'solved' ? '<span style="color:var(--success);font-size:14px;">✓</span>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>'}
              </div>`;
          }).join('') : `
            <div style="padding:40px;text-align:center;">
              <p style="color:var(--text-muted);font-size:var(--text-sm);">No problems found. Try different filters.</p>
            </div>`}
        </div>
      </div>
    `;

    // Search
    const searchInput = container.querySelector('#search-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', () => { clearTimeout(timeout); timeout = setTimeout(() => { filters.query = searchInput.value; renderPage(); }, 300); });
    }
    container.querySelectorAll('.filter-chip').forEach(chip => { chip.addEventListener('click', () => { filters[chip.dataset.type] = chip.dataset.val; renderPage(); }); });
    container.querySelectorAll('.problem-card[data-id]').forEach(card => { card.addEventListener('click', () => router.navigate('learn', { id: card.dataset.id })); });
    const urlBtn = container.querySelector('#url-btn'), urlInput = container.querySelector('#url-input');
    if (urlBtn && urlInput) {
      urlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (!url) return;
        const slug = problemService.parseProblemUrl(url);
        if (!slug) {
          showToast('Invalid LeetCode or GeeksforGeeks link', 'error');
          return;
        }

        // Save to recent links in store
        const recents = store.get('recentLinks') || [];
        const source = url.includes('leetcode') ? 'LeetCode' : 'GeeksforGeeks';
        const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const newEntry = { url, slug, title, source, time: new Date().toLocaleDateString() };
        const updated = [newEntry, ...recents.filter(r => r.slug !== slug)].slice(0, 10);
        store.set('recentLinks', updated);

        const prob = problemService.getById(slug);
        if (prob) {
          router.navigate('learn', { id: prob.id });
        } else {
          router.navigate('learn', { url: encodeURIComponent(url), slug: encodeURIComponent(slug) });
        }
      });
    }
  }

  renderPage();
}
