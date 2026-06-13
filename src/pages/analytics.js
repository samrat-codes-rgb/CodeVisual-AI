import { store } from '../store.js';
import { gamification } from '../services/gamification.js';
import { problemService } from '../services/problems.js';

export function render(container) {
  const stats = gamification.getStats();
  const progress = store.get('progress') || {};
  const solved = progress.solved || [];
  const topics = problemService.getTopics();
  const allProblems = problemService.getAll();

  const topicStats = topics.map(t => {
    const tp = problemService.filterByTopic(t.id);
    return { ...t, solved: tp.filter(p => solved.includes(p.id)).length, total: tp.length };
  }).filter(t => t.total > 0);

  const studyDays = progress.studyDays || [];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - i * 86400000).toDateString();
    return { date: d, active: studyDays.includes(d), day: new Date(d).toLocaleDateString('en', { weekday: 'short' }) };
  }).reverse();

  const easySolved = solved.filter(id => problemService.getById(id)?.difficulty === 'easy').length;
  const medSolved = solved.filter(id => problemService.getById(id)?.difficulty === 'medium').length;
  const hardSolved = solved.filter(id => problemService.getById(id)?.difficulty === 'hard').length;
  const easyTotal = allProblems.filter(p => p.difficulty === 'easy').length;
  const medTotal = allProblems.filter(p => p.difficulty === 'medium').length;
  const hardTotal = allProblems.filter(p => p.difficulty === 'hard').length;

  container.innerHTML = `
    <div class="analytics-page">
      <div class="page-header"><h1>Analytics</h1></div>

      <div class="stats-grid" style="margin-bottom:16px;">
        <div class="stat-card"><div class="stat-value">${solved.length}</div><div class="stat-label">Solved</div></div>
        <div class="stat-card"><div class="stat-value">Lv.${stats.level}</div><div class="stat-label">Level</div></div>
        <div class="stat-card"><div class="stat-value">${stats.totalXP}</div><div class="stat-label">XP</div></div>
        <div class="stat-card"><div class="stat-value">${stats.streak}d</div><div class="stat-label">Streak</div></div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">7-DAY ACTIVITY</div>
        <div style="display:flex;gap:4px;">
          ${last7.map(d => `<div style="flex:1;text-align:center;">
            <div style="height:32px;border-radius:var(--radius-sm);margin-bottom:4px;background:${d.active ? 'var(--accent)' : 'var(--bg-secondary)'};border:1px solid ${d.active ? 'var(--accent)' : 'var(--border)'};"></div>
            <span style="font-size:9px;color:var(--text-muted);">${d.day}</span>
          </div>`).join('')}
        </div>
        <div style="margin-top:6px;font-size:11px;color:var(--text-muted);">${studyDays.length} total days</div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">DIFFICULTY</div>
        ${[{ l: 'Easy', s: easySolved, t: easyTotal, c: 'var(--success)' }, { l: 'Medium', s: medSolved, t: medTotal, c: 'var(--warning)' }, { l: 'Hard', s: hardSolved, t: hardTotal, c: 'var(--error)' }].map(d => `
          <div style="margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:12px;color:var(--text-secondary);">${d.l}</span>
              <span style="font-size:12px;font-weight:600;color:${d.c};">${d.s}/${d.t}</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${d.t>0?Math.round((d.s/d.t)*100):0}%;background:${d.c};"></div></div>
          </div>`).join('')}
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">TOPICS</div>
        ${topicStats.map(t => `
          <div style="margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:12px;color:var(--text-secondary);">${t.name}</span>
              <span style="font-size:11px;color:var(--text-muted);">${t.solved}/${t.total}</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${t.total>0?Math.round((t.solved/t.total)*100):0}%;"></div></div>
          </div>`).join('')}
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">READINESS</div>
        ${[{ l: 'Interview', s: stats.interviewReadiness }, { l: 'Placement', s: stats.placementReadiness }, { l: 'Competitive', s: stats.cpReadiness }].map(i => `
          <div style="margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:12px;color:var(--text-secondary);">${i.l}</span>
              <span style="font-size:12px;font-weight:600;">${i.s}%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${i.s}%;"></div></div>
          </div>`).join('')}
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">BADGES</div>
        ${gamification.getEarnedBadges().length > 0
          ? `<div class="badges-grid">${gamification.getEarnedBadges().slice(0,6).map(b => `<div class="badge-item earned"><div class="badge-icon">${b.icon}</div><div class="badge-name">${b.name}</div></div>`).join('')}</div>
             <button class="btn btn-secondary" onclick="location.hash='profile'" style="width:100%;margin-top:8px;">All badges</button>`
          : '<p style="font-size:12px;color:var(--text-muted);">No badges yet.</p>'}
      </div>
    </div>
  `;
}
