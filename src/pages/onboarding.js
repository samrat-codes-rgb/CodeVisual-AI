import { store } from '../store.js';
import { router } from '../router.js';
import { showToast } from '../components/toast.js';
import { gamification } from '../services/gamification.js';

const QUIZ_QUESTIONS = [
  { q: "Time complexity of accessing an array element by index?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correct: 0, explanation: "Arrays store elements contiguously — index access is constant time." },
  { q: "Which data structure uses LIFO order?", options: ["Queue", "Stack", "Linked List", "Heap"], correct: 1, explanation: "Stack: Last In, First Out." },
  { q: "What does BFS stand for?", options: ["Best First Search", "Breadth First Search", "Binary Format Search", "Base First Scan"], correct: 1, explanation: "Breadth First Search explores level by level." },
  { q: "Worst-case time complexity of QuickSort?", options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], correct: 1, explanation: "Degrades to O(n²) with poor pivot choices." },
  { q: "Which algorithm finds shortest paths in weighted graphs?", options: ["BFS", "DFS", "Dijkstra", "Prim"], correct: 2, explanation: "Dijkstra's algorithm handles non-negative weighted graphs." },
];

const STEPS = ['welcome', 'profile', 'quiz', 'results'];

export function render(container) {
  let currentStep = 0;
  let quizAnswers = [];
  let currentQuestion = 0;
  let quizScore = 0;

  const profileData = {
    name: store.get('user.name') || '',
    goal: store.get('user.goal') || '',
    year: store.get('user.year') || '',
    language: store.get('user.language') || 'python',
    hours: store.get('user.hours') || 5,
  };

  function renderStep() {
    container.innerHTML = '';
    container.style.padding = '0';
    container.style.paddingBottom = '0';
    const page = document.createElement('div');
    page.className = 'onboarding-page';
    page.innerHTML = buildStep(currentStep);
    container.appendChild(page);
    attachEvents(page);
  }

  function buildStep(step) {
    const indicators = STEPS.map((_, i) => `<div class="step-dot ${i === step ? 'active' : i < step ? 'done' : ''}"></div>`).join('');

    if (step === 0) return `
      <div class="onboarding-hero" style="flex:1;overflow-y:auto;">
        <div class="onboarding-logo">CV</div>
        <h1>CodeVisual AI</h1>
        <p>Learn data structures and algorithms through animated visualizations, AI-powered explanations, and structured practice.</p>
        <div class="onboarding-features">
          <div class="feature-item"><div class="feature-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></div><div><strong>Visualizations</strong><span>Step-by-step algorithm animations</span></div></div>
          <div class="feature-item"><div class="feature-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div><strong>AI Tutor</strong><span>Get instant explanations for any doubt</span></div></div>
          <div class="feature-item"><div class="feature-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg></div><div><strong>Learning Path</strong><span>Structured roadmap from basics to advanced</span></div></div>
          <div class="feature-item"><div class="feature-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div><strong>Progress Tracking</strong><span>XP, streaks, and milestones</span></div></div>
        </div>
      </div>
      <div class="onboarding-footer">
        <div class="step-indicators">${indicators}</div>
        <button class="btn btn-primary" id="btn-next" style="width:100%;padding:12px;">Get started</button>
      </div>`;

    if (step === 1) return `
      <div class="onboarding-hero" style="flex:1;overflow-y:auto;text-align:left;align-items:stretch;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:20px;">About you</h2>
        <div style="display:flex;flex-direction:column;gap:12px;width:100%;">
          <div><label class="form-label">Name</label><input class="input" id="inp-name" placeholder="Your name" value="${profileData.name}" /></div>
          <div><label class="form-label">Goal</label>
            <select class="input select" id="inp-goal">
              <option value="">Select goal...</option>
              <option value="placements" ${profileData.goal==='placements'?'selected':''}>Placement preparation</option>
              <option value="competitive" ${profileData.goal==='competitive'?'selected':''}>Competitive programming</option>
              <option value="faang" ${profileData.goal==='faang'?'selected':''}>FAANG interviews</option>
              <option value="learn" ${profileData.goal==='learn'?'selected':''}>Learn DSA basics</option>
              <option value="gate" ${profileData.goal==='gate'?'selected':''}>GATE preparation</option>
            </select></div>
          <div><label class="form-label">Year / Experience</label>
            <select class="input select" id="inp-year">
              <option value="">Select...</option>
              <option value="1st" ${profileData.year==='1st'?'selected':''}>1st year</option>
              <option value="2nd" ${profileData.year==='2nd'?'selected':''}>2nd year</option>
              <option value="3rd" ${profileData.year==='3rd'?'selected':''}>3rd year</option>
              <option value="4th" ${profileData.year==='4th'?'selected':''}>4th year</option>
              <option value="fresher" ${profileData.year==='fresher'?'selected':''}>Fresher / working</option>
              <option value="experienced" ${profileData.year==='experienced'?'selected':''}>Experienced</option>
            </select></div>
          <div><label class="form-label">Preferred language</label>
            <select class="input select" id="inp-lang">
              <option value="python" ${profileData.language==='python'?'selected':''}>Python</option>
              <option value="java" ${profileData.language==='java'?'selected':''}>Java</option>
              <option value="cpp" ${profileData.language==='cpp'?'selected':''}>C++</option>
              <option value="javascript" ${profileData.language==='javascript'?'selected':''}>JavaScript</option>
            </select></div>
          <div><label class="form-label">Hours per week: <span id="hours-val" style="color:var(--text-primary);">${profileData.hours}</span></label>
            <input type="range" id="inp-hours" min="1" max="40" value="${profileData.hours}" style="width:100%;accent-color:var(--accent);" /></div>
        </div>
      </div>
      <div class="onboarding-footer">
        <div class="step-indicators">${indicators}</div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary" id="btn-back" style="flex:0 0 auto;">Back</button>
          <button class="btn btn-primary" id="btn-next" style="flex:1;">Continue</button>
        </div>
      </div>`;

    if (step === 2) {
      const q = QUIZ_QUESTIONS[currentQuestion];
      return `
      <div class="onboarding-hero" style="flex:1;overflow-y:auto;text-align:left;align-items:stretch;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 style="font-size:1.125rem;font-weight:700;">Skill check</h2>
          <span style="font-size:11px;color:var(--text-muted);">${currentQuestion+1} / ${QUIZ_QUESTIONS.length}</span>
        </div>
        <div style="height:3px;background:var(--bg-secondary);border-radius:2px;margin-bottom:20px;overflow:hidden;">
          <div style="height:100%;width:${((currentQuestion+1)/QUIZ_QUESTIONS.length)*100}%;background:var(--accent);border-radius:2px;transition:width .3s;"></div>
        </div>
        <p style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary);line-height:1.6;margin-bottom:16px;">${q.q}</p>
        <div id="quiz-options">
          ${q.options.map((opt, i) => `<button class="quiz-option" data-idx="${i}">${opt}</button>`).join('')}
        </div>
        <div id="explanation" style="display:none;margin-top:12px;padding:10px 12px;background:var(--accent-muted);border:1px solid var(--accent-border);border-radius:var(--radius-md);font-size:12px;color:var(--text-secondary);"></div>
      </div>
      <div class="onboarding-footer">
        <div class="step-indicators">${indicators}</div>
        <button class="btn btn-primary" id="btn-next" style="width:100%;opacity:.4;cursor:not-allowed;" disabled>Select an answer</button>
      </div>`;
    }

    if (step === 3) {
      const pct = Math.round((quizScore / QUIZ_QUESTIONS.length) * 100);
      const level = pct >= 80 ? 'Advanced' : pct >= 50 ? 'Intermediate' : 'Beginner';
      return `
      <div class="onboarding-hero" style="flex:1;overflow-y:auto;">
        <h2 style="font-size:1.375rem;font-weight:700;color:var(--text-primary);margin-bottom:4px;">Assessment complete</h2>
        <p style="color:var(--text-muted);margin-bottom:24px;font-size:var(--text-sm);">Here's your starting point.</p>
        <div class="card" style="width:100%;text-align:left;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div class="avatar" style="font-size:16px;width:48px;height:48px;">${(profileData.name || 'C')[0].toUpperCase()}</div>
            <div>
              <h3 style="font-size:1rem;font-weight:700;color:var(--text-primary);margin:0;">${profileData.name || 'Coder'}</h3>
              <span style="font-size:12px;font-weight:600;color:var(--accent);">${level}</span>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div style="background:var(--bg-secondary);border-radius:var(--radius-md);padding:12px;text-align:center;">
              <div style="font-size:1.25rem;font-weight:700;color:var(--text-primary);">${quizScore}/${QUIZ_QUESTIONS.length}</div>
              <div style="font-size:11px;color:var(--text-muted);">Score</div>
            </div>
            <div style="background:var(--bg-secondary);border-radius:var(--radius-md);padding:12px;text-align:center;">
              <div style="font-size:1.25rem;font-weight:700;color:var(--text-primary);">${pct}%</div>
              <div style="font-size:11px;color:var(--text-muted);">Accuracy</div>
            </div>
          </div>
        </div>
        <div class="card" style="width:100%;text-align:left;">
          <h4 style="font-size:12px;font-weight:600;margin-bottom:10px;color:var(--text-muted);">Your roadmap</h4>
          ${['Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack & Queue', 'Binary Search', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming'].map((t, i) => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <div style="width:20px;height:20px;border-radius:50%;background:${i < (pct >= 80 ? 4 : pct >= 50 ? 2 : 0) ? 'var(--success)' : 'var(--accent)'};display:flex;align-items:center;justify-content:center;font-size:10px;color:white;font-weight:600;">${i+1}</div>
              <span style="font-size:var(--text-sm);color:var(--text-secondary);">${t}</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="onboarding-footer">
        <div class="step-indicators">${indicators}</div>
        <button class="btn btn-primary" id="btn-finish" style="width:100%;padding:12px;">Start learning</button>
      </div>`;
    }
    return '';
  }

  function attachEvents(page) {
    const btnNext = page.querySelector('#btn-next');
    const btnBack = page.querySelector('#btn-back');

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (currentStep === 1) {
          const name = page.querySelector('#inp-name')?.value.trim();
          if (!name) { showToast('Please enter your name', 'warning'); return; }
          profileData.name = name;
          profileData.goal = page.querySelector('#inp-goal')?.value || '';
          profileData.year = page.querySelector('#inp-year')?.value || '';
          profileData.language = page.querySelector('#inp-lang')?.value || 'python';
          profileData.hours = parseInt(page.querySelector('#inp-hours')?.value) || 5;
        }
        currentStep++;
        if (currentStep === 2) { currentQuestion = 0; quizScore = 0; quizAnswers = []; }
        renderStep();
      });
    }

    if (btnBack) {
      btnBack.addEventListener('click', () => { currentStep = Math.max(0, currentStep - 1); renderStep(); });
    }

    if (currentStep === 2) {
      const options = page.querySelectorAll('.quiz-option');
      const btnQ = page.querySelector('#btn-next');
      const explanation = page.querySelector('#explanation');
      options.forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.classList.contains('correct')) return;
          const idx = parseInt(btn.dataset.idx);
          const correct = QUIZ_QUESTIONS[currentQuestion].correct;
          options.forEach(b => b.disabled = true);
          if (idx === correct) { btn.classList.add('correct'); quizScore++; }
          else { btn.classList.add('wrong'); options[correct].classList.add('correct'); }
          explanation.textContent = QUIZ_QUESTIONS[currentQuestion].explanation;
          explanation.style.display = 'block';
          if (btnQ) { btnQ.disabled = false; btnQ.style.opacity = '1'; btnQ.style.cursor = 'pointer'; }
          btnQ.textContent = currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Next' : 'See results';
          btnQ.onclick = () => {
            currentQuestion++;
            if (currentQuestion >= QUIZ_QUESTIONS.length) { currentStep = 3; renderStep(); }
            else renderStep();
          };
        });
      });
    }

    const hoursSlider = page.querySelector('#inp-hours');
    const hoursVal = page.querySelector('#hours-val');
    if (hoursSlider && hoursVal) hoursSlider.addEventListener('input', () => { hoursVal.textContent = hoursSlider.value; });

    const btnFinish = page.querySelector('#btn-finish');
    if (btnFinish) {
      btnFinish.addEventListener('click', () => {
        const pct = Math.round((quizScore / QUIZ_QUESTIONS.length) * 100);
        const skillLevel = pct >= 80 ? 'advanced' : pct >= 50 ? 'intermediate' : 'beginner';
        store.set('user', { ...store.get('user'), name: profileData.name, goal: profileData.goal, year: profileData.year, language: profileData.language, hours: profileData.hours, onboarded: true, skillScore: pct, skillLevel, level: 1, xp: 50, streak: 0, lastActive: new Date().toDateString() });
        store.set('gamification.totalXP', 50);
        gamification.updateStreak();
        showToast(`Welcome, ${profileData.name || 'Coder'}.`, 'success', 3000);
        router.navigate('dashboard');
      });
    }
  }

  renderStep();
}
