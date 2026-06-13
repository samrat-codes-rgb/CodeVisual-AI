import { problemService } from '../services/problems.js';
import { store } from '../store.js';

export function render(container) {
  const topics = problemService.getTopics().sort((a, b) => a.order - b.order);
  const solved = store.get('progress.solved') || [];

  const topicsWithProgress = topics.map(t => {
    const tp = problemService.filterByTopic(t.id);
    const sc = tp.filter(p => solved.includes(p.id)).length;
    const pct = tp.length > 0 ? Math.round((sc / tp.length) * 100) : 0;
    const isUnlocked = !t.prerequisites?.length || t.prerequisites.every(p => {
      const pp = problemService.filterByTopic(p);
      return pp.filter(pr => solved.includes(pr.id)).length > 0;
    });
    return { ...t, solvedCount: sc, total: tp.length, pct, isUnlocked };
  });

  const totalPct = Math.round((solved.length / Math.max(problemService.getAll().length, 1)) * 100);

  container.innerHTML = `
    <div class="roadmap-page">
      <div class="page-header"><h1>Roadmap</h1></div>

      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <div>
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);">Overall progress</div>
            <div style="font-size:11px;color:var(--text-muted);">${solved.length} of ${problemService.getAll().length} problems</div>
          </div>
          <span style="font-size:1.25rem;font-weight:700;color:var(--accent);">${totalPct}%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${totalPct}%;"></div></div>
      </div>

      <div class="section-title">Topics</div>
      <div class="roadmap-path">
        ${topicsWithProgress.map((t, i) => `
          <div class="roadmap-node ${t.isUnlocked ? 'unlocked' : 'locked'}" data-topic="${t.id}" style="cursor:${t.isUnlocked ? 'pointer' : 'default'};">
            ${i > 0 ? '<div class="roadmap-connector"></div>' : ''}
            <div class="roadmap-node-content">
              <div class="roadmap-icon-wrap" style="background:${t.pct === 100 ? 'var(--success-muted)' : t.isUnlocked ? 'var(--accent-muted)' : 'var(--bg-secondary)'};border:1.5px solid ${t.pct === 100 ? 'var(--success)' : t.isUnlocked ? 'var(--accent-border)' : 'var(--border)'};">
                <span style="font-size:14px;">${t.pct === 100 ? '✓' : t.isUnlocked ? (i+1) : '—'}</span>
              </div>
              <div class="roadmap-node-body">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                  <span style="font-size:var(--text-sm);font-weight:600;color:${t.isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)'};">${t.name}</span>
                </div>
                <p style="font-size:11px;color:var(--text-muted);margin:0 0 4px;">${t.description}</p>
                ${t.isUnlocked ? `
                  <div style="display:flex;align-items:center;gap:6px;">
                    <div class="progress-bar" style="height:4px;flex:1;"><div class="progress-fill" style="width:${t.pct}%;"></div></div>
                    <span style="font-size:10px;color:var(--text-muted);">${t.solvedCount}/${t.total}</span>
                  </div>` : `<span style="font-size:10px;color:var(--text-muted);">Locked — complete prerequisites</span>`}
              </div>
              ${t.isUnlocked ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="flex-shrink:0;"><polyline points="9 18 15 12 9 6"/></svg>' : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.roadmap-node.unlocked').forEach(node => {
    node.addEventListener('click', () => location.hash = 'problems');
  });
}
