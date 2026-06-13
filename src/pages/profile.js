import { store } from '../store.js';
import { gamification } from '../services/gamification.js';
import { showToast } from '../components/toast.js';
import { toggleTheme } from '../theme.js';

export function render(container) {
  let activeTab = 'profile';

  function renderPage() {
    const user = store.get('user') || {};
    const stats = gamification.getStats();
    const progress = store.get('progress') || {};
    const settings = store.get('settings') || {};
    const solved = progress.solved || [];

    container.innerHTML = `
      <div class="profile-page">
        <div class="profile-header">
          <div class="avatar-container">
            <div class="avatar avatar-xl" style="font-size:20px;font-weight:700;">${(user.name || 'C')[0].toUpperCase()}</div>
            <div class="avatar-level-badge">Lv.${stats.level}</div>
          </div>
          <h2 class="profile-name">${user.name || 'Coder'}</h2>
          <p class="profile-goal">${getGoalLabel(user.goal)} · ${user.year || ''}</p>
          <div class="profile-stats-row">
            <div class="pstat"><span>${solved.length}</span><label>Solved</label></div>
            <div class="pstat"><span>${stats.streak}d</span><label>Streak</label></div>
            <div class="pstat"><span>${stats.totalXP}</span><label>XP</label></div>
            <div class="pstat"><span>${stats.badges}</span><label>Badges</label></div>
          </div>
          <div style="width:100%;margin-top:12px;">
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:4px;">
              <span>Level ${stats.level}</span><span>${stats.levelProgress}%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${stats.levelProgress}%;"></div></div>
          </div>
        </div>

        <div class="tab-bar" style="margin-bottom:16px;" id="profile-tabs">
          <div class="tab-item ${activeTab === 'profile' ? 'active' : ''}" data-tab="profile">Profile</div>
          <div class="tab-item ${activeTab === 'badges' ? 'active' : ''}" data-tab="badges">Badges</div>
          <div class="tab-item ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">Settings</div>
        </div>
        <div id="tab-content">${renderTabContent(activeTab, user, stats, progress, settings)}</div>
      </div>
    `;
    attachEvents(container);
  }

  function renderTabContent(tab, user, stats, progress, settings) {
    if (tab === 'profile') {
      return `
        <div class="card" style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:12px;">EDIT PROFILE</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div><label class="form-label">Name</label><input class="input" id="edit-name" value="${user.name||''}" /></div>
            <div><label class="form-label">Goal</label>
              <select class="input select" id="edit-goal">
                <option value="">Select...</option>
                ${[['placements','Placement prep'],['competitive','Competitive programming'],['faang','FAANG interviews'],['learn','Learn DSA'],['gate','GATE prep']].map(([v,l]) => `<option value="${v}" ${user.goal===v?'selected':''}>${l}</option>`).join('')}
              </select></div>
            <div><label class="form-label">Language</label>
              <select class="input select" id="edit-lang">
                <option value="python" ${settings.language==='python'?'selected':''}>Python</option>
                <option value="java" ${settings.language==='java'?'selected':''}>Java</option>
                <option value="cpp" ${settings.language==='cpp'?'selected':''}>C++</option>
                <option value="javascript" ${settings.language==='javascript'?'selected':''}>JavaScript</option>
              </select></div>
            <div><label class="form-label">Hours/week: <strong id="hours-label">${user.hours||5}</strong></label>
              <input type="range" id="edit-hours" min="1" max="40" value="${user.hours||5}" style="width:100%;accent-color:var(--accent);" /></div>
          </div>
          <button class="btn btn-primary" id="btn-save-profile" style="width:100%;margin-top:12px;">Save</button>
        </div>

        <div class="card" style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:12px;">ACTIVITY</div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
            ${[
              { label: 'Study days', val: (progress.studyDays||[]).length },
              { label: 'Problems', val: (progress.solved||[]).length },
              { label: 'AI questions', val: progress.aiQuestionsAsked||0 },
              { label: 'Visualizations', val: progress.visualizationsWatched||0 },
            ].map(s => `
              <div style="background:var(--bg-secondary);border-radius:var(--radius-md);padding:10px;text-align:center;">
                <div style="font-size:1.125rem;font-weight:700;color:var(--text-primary);">${s.val}</div>
                <div style="font-size:10px;color:var(--text-muted);">${s.label}</div>
              </div>`).join('')}
          </div>
        </div>

        <button class="btn btn-danger" id="btn-reset" style="width:100%;margin-bottom:12px;">Reset progress</button>
      `;
    }

    if (tab === 'badges') {
      const earned = gamification.getEarnedBadges();
      const unearned = gamification.getUnearnedBadges();
      return `
        ${earned.length > 0 ? `
        <div class="section-title">Earned · ${earned.length}</div>
        <div class="badges-grid" style="margin-bottom:16px;">
          ${earned.map(b => `<div class="badge-item earned" title="${b.description}"><div class="badge-icon">${b.icon}</div><div class="badge-name">${b.name}</div><div class="badge-xp">+${b.xp} XP</div></div>`).join('')}
        </div>` : `
        <div style="text-align:center;padding:32px 16px;color:var(--text-muted);">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg></div>
          <p style="font-size:var(--text-sm);">No badges yet. Solve problems to earn them.</p>
        </div>`}
        <div class="section-title">Locked · ${unearned.length}</div>
        <div class="badges-grid">
          ${unearned.slice(0,12).map(b => `<div class="badge-item locked"><div class="badge-icon" style="opacity:.3;">${b.icon}</div><div class="badge-name" style="color:var(--text-muted);">${b.name}</div></div>`).join('')}
        </div>
      `;
    }

    if (tab === 'settings') {
      const apiKey = store.get('settings.apiKey') || '';
      const theme = store.get('settings.theme') || 'dark';
      return `
        <div class="card" style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:10px;">AI CONFIGURATION</div>
          <div style="margin-bottom:8px;">
            <label class="form-label">Gemini API key <a href="https://aistudio.google.com/apikey" target="_blank" style="color:var(--accent);font-size:10px;">Get free key →</a></label>
            <input class="input" id="api-key-input" type="password" placeholder="AIza..." value="${apiKey}" />
            <p style="font-size:10px;color:var(--text-muted);margin-top:4px;">Stored locally. Never sent to any server.</p>
          </div>
          <button class="btn btn-primary" id="btn-save-key" style="width:100%;">Save key</button>
        </div>

        <div class="card" style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:10px;">ELEVENLABS TTS CONFIGURATION</div>
          <div style="margin-bottom:8px;">
            <label class="form-label">ElevenLabs API key <a href="https://elevenlabs.io" target="_blank" style="color:var(--accent);font-size:10px;">Get key →</a></label>
            <input class="input" id="elevenlabs-key-input" type="password" placeholder="xi-apiKey..." value="${store.get('settings.elevenLabsKey') || ''}" />
          </div>
          <div style="margin-bottom:8px;">
            <label class="form-label">Voice ID</label>
            <input class="input" id="elevenlabs-voice-input" type="text" placeholder="Voice ID" value="${store.get('settings.elevenLabsVoiceId') || 'BTNeCNdXniCSbjEac5vd'}" />
            <p style="font-size:10px;color:var(--text-muted);margin-top:4px;">Default is your custom shared voice. Requires an ElevenLabs key to play; falls back to browser TTS if empty.</p>
          </div>
          <button class="btn btn-primary" id="btn-save-elevenlabs" style="width:100%;">Save ElevenLabs settings</button>
        </div>

        <div class="card" style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:10px;">EXPLANATION LANGUAGE</div>
          <div style="margin-bottom:8px;">
            <label class="form-label">Select default language for AI explanations & chat</label>
            <select class="input select" id="settings-expl-lang">
              <option value="english" ${store.get('settings.explanationLanguage')==='english'?'selected':''}>English</option>
              <option value="hinglish" ${store.get('settings.explanationLanguage')==='hinglish'?'selected':''}>Hinglish</option>
              <option value="hindi" ${store.get('settings.explanationLanguage')==='hindi'?'selected':''}>हिन्दी (Hindi)</option>
            </select>
          </div>
          <button class="btn btn-primary" id="btn-save-expl-lang" style="width:100%;">Save language preference</button>
        </div>

        <div class="card" style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:10px;">APPEARANCE</div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:var(--text-sm);color:var(--text-secondary);">${theme === 'dark' ? 'Dark' : 'Light'} mode</span>
            <button class="btn btn-secondary" id="btn-toggle-theme" style="padding:6px 12px;font-size:11px;">Toggle</button>
          </div>
        </div>

        <div class="card" style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">ABOUT</div>
          <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">
            <strong style="color:var(--text-primary);">CodeVisual AI v1.0</strong><br/>
            Built with Vite, Vanilla JS, Canvas API, and Gemini AI.
          </p>
        </div>

        <div class="card" style="border-color:var(--error-muted);">
          <button class="btn btn-danger" id="btn-reset-all" style="width:100%;">Reset all data</button>
        </div>
      `;
    }
    return '';
  }

  function attachEvents(container) {
    container.querySelectorAll('[data-tab]').forEach(tab => { tab.addEventListener('click', () => { activeTab = tab.dataset.tab; renderPage(); }); });
    container.querySelector('#btn-save-profile')?.addEventListener('click', () => {
      const name = container.querySelector('#edit-name')?.value.trim();
      if (!name) { showToast('Name required', 'warning'); return; }
      store.set('user.name', name);
      store.set('user.goal', container.querySelector('#edit-goal')?.value);
      const lang = container.querySelector('#edit-lang')?.value;
      store.set('user.language', lang); store.set('settings.language', lang);
      store.set('user.hours', parseInt(container.querySelector('#edit-hours')?.value) || 5);
      showToast('Profile saved', 'success');
    });
    const hs = container.querySelector('#edit-hours'), hl = container.querySelector('#hours-label');
    if (hs && hl) hs.addEventListener('input', () => { hl.textContent = hs.value; });
    container.querySelector('#btn-save-key')?.addEventListener('click', () => {
      const key = container.querySelector('#api-key-input')?.value.trim();
      store.set('settings.apiKey', key);
      import('../services/ai.js').then(({ ai }) => ai.setApiKey(key));
      showToast(key ? 'API key saved' : 'API key cleared', 'success');
    });
    container.querySelector('#btn-save-elevenlabs')?.addEventListener('click', () => {
      const key = container.querySelector('#elevenlabs-key-input')?.value.trim();
      const voiceId = container.querySelector('#elevenlabs-voice-input')?.value.trim() || 'BTNeCNdXniCSbjEac5vd';
      store.set('settings.elevenLabsKey', key);
      store.set('settings.elevenLabsVoiceId', voiceId);
      showToast(key ? 'ElevenLabs settings saved!' : 'ElevenLabs key cleared', 'success');
      renderPage();
    });
    container.querySelector('#btn-save-expl-lang')?.addEventListener('click', () => {
      const explLang = container.querySelector('#settings-expl-lang')?.value;
      store.set('settings.explanationLanguage', explLang);
      showToast('Explanation language saved!', 'success');
      renderPage();
    });
    container.querySelector('#btn-toggle-theme')?.addEventListener('click', () => { const t = toggleTheme(); showToast(`${t} mode`, 'info'); renderPage(); });
    container.querySelector('#btn-reset')?.addEventListener('click', () => {
      if (confirm('Reset solved problems and activity?')) { store.set('progress', { solved: [], attempted: [], bookmarked: [], topicMastery: {}, dailyGoals: [], studyDays: [], visualizationsWatched: 0, aiQuestionsAsked: 0 }); showToast('Progress reset', 'info'); renderPage(); }
    });
    container.querySelector('#btn-reset-all')?.addEventListener('click', () => {
      if (confirm('Delete all data including profile?')) { store.reset(); location.hash = 'onboarding'; }
    });
  }

  function getGoalLabel(g) { return { placements:'Placement prep', competitive:'Competitive programming', faang:'FAANG interviews', learn:'Learning DSA', gate:'GATE prep' }[g] || 'Learning'; }

  renderPage();
}
