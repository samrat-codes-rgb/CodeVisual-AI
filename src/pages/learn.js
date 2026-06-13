// ============================================
// LEARN.JS — Core page: Problem + AI Explanation + Animated Visualization + Chat + TTS
// ============================================

import { store } from '../store.js';
import { ai } from '../services/ai.js';
import { speech } from '../services/speech.js';
import { problemService } from '../services/problems.js';
import { gamification } from '../services/gamification.js';
import { showToast } from '../components/toast.js';
import { sound } from '../services/sound.js';

function getFriendlyExplanation(step) {
  if (!step || !step.message) return '';
  let msg = step.message;
  const explLang = store.get('settings.explanationLanguage') || 'english';
  
  if (explLang === 'hindi') {
    // Clean up standard array messages with Hindi/Devanagari style
    msg = msg.replace(/Comparing arr\[(\d+)\]=(\d+) and arr\[(\d+)\]=(\d+)/i, "अब $2 और $4 की तुलना करते हैं।");
    msg = msg.replace(/Swapping (\d+) and (\d+)/i, "चलो, $1 और $2 को आपस में बदल देते हैं।");
    msg = msg.replace(/Visiting element at index (\d+) → value (\d+)/i, "इंडेक्स $1 पर एलिमेंट $2 को चेक करते हैं।");
    msg = msg.replace(/Traversal complete/i, "ट्रैवर्सल पूरा हो गया है, सारे एलिमेंट्स देख लिए!");
    msg = msg.replace(/Bubble Sort complete/i, "बबल सॉर्ट पूरा हो गया, एरे सॉर्टेड है।");
    msg = msg.replace(/Selection Sort complete/i, "सिलेक्शन सॉर्ट पूरा हो गया, एरे सॉर्टेड है।");
    msg = msg.replace(/arr\[(\d+)\]=(\d+) < (\d+) → search right half/i, "चूंकि हमारा नंबर $2 टारगेट $3 से छोटा है, हम दाहिने हिस्से में ढूंढेंगे।");
    msg = msg.replace(/arr\[(\d+)\]=(\d+) > (\d+) → search left half/i, "चूंकि हमारा नंबर $2 टारगेट $3 से बड़ा है, हम बाएं हिस्से में ढूंढेंगे।");
    msg = msg.replace(/Checking mid = (\d+), arr\[\d+\] = (\d+)/i, "अब बीच वाले एलिमेंट $2 को चेक करते हैं।");
    msg = msg.replace(/Found target (\d+) at index (\d+)/i, "टारगेट $1 मिल गया इंडेक्स $2 पर!");
    msg = msg.replace(/Target (\d+) not found/i, "टारगेट $1 पूरे एरे में नहीं मिला।");
    
    // Clean up Stack/Queue messages
    msg = msg.replace(/PUSH (\d+) → pushed onto stack/i, "चलो $1 को स्टैक के ऊपर डाल देते हैं।");
    msg = msg.replace(/POP → removing (\d+)/i, "स्टैक के ऊपर से $1 को निकाल देते हैं।");
    msg = msg.replace(/ENQUEUE (\d+) → added to rear/i, "क्यू के अंत में $1 को जोड़ देते हैं।");
    msg = msg.replace(/DEQUEUE → removing (\d+) from front/i, "क्यू के शुरुआत से $1 को हटा देते हैं।");
    
    // Clean up Linked List messages
    msg = msg.replace(/Created new node with value (\d+)/i, "पहले $1 वैल्यू का एक नया नोड बनाते हैं।");
    msg = msg.replace(/Set newNode\.next → old head/i, "अब नए नोड के नेक्स्ट को हेड पर पॉइंट करते हैं।");
    msg = msg.replace(/Insert at head complete/i, "$1 लिस्ट के हेड पर इन्सर्ट हो गया।");
    msg = msg.replace(/Reverse linked list/i, "चलिए लिंक्ड लिस्ट को रिवर्स करते हैं।");
  } else if (explLang === 'english') {
    // Clean up standard array messages with clean standard English
    msg = msg.replace(/Comparing arr\[(\d+)\]=(\d+) and arr\[(\d+)\]=(\d+)/i, "Now we compare $2 and $4.");
    msg = msg.replace(/Swapping (\d+) and (\d+)/i, "We swap $1 and $2.");
    msg = msg.replace(/Visiting element at index (\d+) → value (\d+)/i, "We check the element at index $1, which is $2.");
    msg = msg.replace(/Traversal complete/i, "Traversal is complete! We checked all elements.");
    msg = msg.replace(/Bubble Sort complete/i, "Bubble sort is complete, the array is fully sorted.");
    msg = msg.replace(/Selection Sort complete/i, "Selection sort is complete, the array is sorted now.");
    msg = msg.replace(/arr\[(\d+)\]=(\d+) < (\d+) → search right half/i, "Since our number $2 is smaller than target $3, we search the right half.");
    msg = msg.replace(/arr\[(\d+)\]=(\d+) > (\d+) → search left half/i, "Since our number $2 is larger than target $3, we search the left half.");
    msg = msg.replace(/Checking mid = (\d+), arr\[\d+\] = (\d+)/i, "We check the middle element, which is $2.");
    msg = msg.replace(/Found target (\d+) at index (\d+)/i, "We found the target $1 at index $2.");
    msg = msg.replace(/Target (\d+) not found/i, "Target $1 was not found in the array.");
    
    // Clean up Stack/Queue messages
    msg = msg.replace(/PUSH (\d+) → pushed onto stack/i, "We push $1 onto the top of the stack.");
    msg = msg.replace(/POP → removing (\d+)/i, "We pop the top element, which is $1.");
    msg = msg.replace(/ENQUEUE (\d+) → added to rear/i, "We add $1 to the back of the queue.");
    msg = msg.replace(/DEQUEUE → removing (\d+) from front/i, "We remove $1 from the front of the queue.");
    
    // Clean up Linked List messages
    msg = msg.replace(/Created new node with value (\d+)/i, "We create a new node with value $1.");
    msg = msg.replace(/Set newNode\.next → old head/i, "We point the new node's next to the old head and update the head pointer.");
    msg = msg.replace(/Insert at head complete/i, "$1 is now inserted at the head of the list.");
    msg = msg.replace(/Reverse linked list/i, "Let's reverse the linked list step-by-step.");
  } else {
    // Clean up standard array messages with friendly Hinglish style
    msg = msg.replace(/Comparing arr\[(\d+)\]=(\d+) and arr\[(\d+)\]=(\d+)/i, "Acha, now we compare $2 and $4.");
    msg = msg.replace(/Swapping (\d+) and (\d+)/i, "Chalo, let's swap $1 and $2.");
    msg = msg.replace(/Visiting element at index (\d+) → value (\d+)/i, "Let's check the element at index $1, which is $2.");
    msg = msg.replace(/Traversal complete/i, "Chalo, traversal is complete! We checked all elements.");
    msg = msg.replace(/Bubble Sort complete/i, "Sahi hai! Bubble sort is done, array is fully sorted.");
    msg = msg.replace(/Selection Sort complete/i, "Awesome! Selection sort is complete, array is sorted now.");
    msg = msg.replace(/arr\[(\d+)\]=(\d+) < (\d+) → search right half/i, "Since our number $2 is smaller than target $3, toh right half mein search karenge.");
    msg = msg.replace(/arr\[(\d+)\]=(\d+) > (\d+) → search left half/i, "Since our number $2 is larger than target $3, toh left half mein search karenge.");
    msg = msg.replace(/Checking mid = (\d+), arr\[\d+\] = (\d+)/i, "Now, let's check the middle element, which is $2.");
    msg = msg.replace(/Found target (\d+) at index (\d+)/i, "Mil gaya! We found the target $1 at index $2.");
    msg = msg.replace(/Target (\d+) not found/i, "Target $1 was not found in the array, yaar.");
    
    // Clean up Stack/Queue messages
    msg = msg.replace(/PUSH (\d+) → pushed onto stack/i, "Bhai, let's push $1 onto the top of the stack.");
    msg = msg.replace(/POP → removing (\d+)/i, "Now we pop the top element, which is $1, off the stack.");
    msg = msg.replace(/ENQUEUE (\d+) → added to rear/i, "Chalo, let's add $1 to the back of the queue.");
    msg = msg.replace(/DEQUEUE → removing (\d+) from front/i, "We remove $1 from the front of the queue.");
    
    // Clean up Linked List messages
    msg = msg.replace(/Created new node with value (\d+)/i, "Pehle ek new node banate hain with value $1.");
    msg = msg.replace(/Set newNode\.next → old head/i, "Ab new node ke next pointer ko old head pe point karenge, and update the head pointer.");
    msg = msg.replace(/Insert at head complete/i, "Sahi hai, $1 is now inserted at the head of the list.");
    msg = msg.replace(/Reverse linked list/i, "Chalo, let's reverse this linked list step-by-step.");
  }
  
  return msg;
}

function playSoundForStep(step, stepIdx, totalSteps) {
  if (!step) return;
  if (stepIdx === totalSteps - 1) {
    sound.playSuccess();
  } else if (step.swapping && step.swapping.length > 0) {
    sound.playSwap();
  } else if (step.comparing && step.comparing.length > 0) {
    sound.playCompare();
  } else if (step.active && step.active.length > 0) {
    sound.playStep();
  } else {
    sound.playTick(450, 0.04, 'sine', 0.04);
  }
}

function renderMarkdown(text) {
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:#111113;border-radius:8px;padding:12px;overflow-x:auto;border:1px solid var(--border);margin:8px 0;"><code style="font-family:JetBrains Mono,Consolas,monospace;font-size:12px;color:#e2e8f0;">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-secondary);padding:1px 5px;border-radius:3px;font-size:0.9em;color:var(--accent);">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^#{3} (.+)$/gm, '<h4 style="color:var(--text-primary);margin:12px 0 6px;font-size:13px;">$1</h4>')
    .replace(/^#{2} (.+)$/gm, '<h3 style="color:var(--text-primary);margin:14px 0 6px;font-size:14px;">$1</h3>')
    .replace(/^#{1} (.+)$/gm, '<h2 style="color:var(--text-primary);margin:16px 0 8px;font-size:16px;font-weight:700;">$1</h2>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0 3px 16px;font-size:13px;">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

function escHtml(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// ── Map problem topics to visualizer modules ──
const TOPIC_TO_VIZ = {
  'arrays':             { mod: 'arrayVisualizer',       import: () => import('../visualizer/array.js'),       defaultOp: 'Two Pointer' },
  'hash-table':         { mod: 'arrayVisualizer',       import: () => import('../visualizer/array.js'),       defaultOp: 'Traversal' },
  'sorting':            { mod: 'arrayVisualizer',       import: () => import('../visualizer/array.js'),       defaultOp: 'Bubble Sort' },
  'binary-search':      { mod: 'arrayVisualizer',       import: () => import('../visualizer/array.js'),       defaultOp: 'Binary Search' },
  'two-pointers':       { mod: 'arrayVisualizer',       import: () => import('../visualizer/array.js'),       defaultOp: 'Two Pointer' },
  'sliding-window':     { mod: 'arrayVisualizer',       import: () => import('../visualizer/array.js'),       defaultOp: 'Sliding Window' },
  'linked-list':        { mod: 'linkedListVisualizer',  import: () => import('../visualizer/linkedlist.js'),  defaultOp: null },
  'stack':              { mod: 'stackQueueVisualizer',  import: () => import('../visualizer/stack-queue.js'), defaultOp: 'Stack - Push' },
  'queue':              { mod: 'stackQueueVisualizer',  import: () => import('../visualizer/stack-queue.js'), defaultOp: 'Queue - Enqueue' },
  'tree':               { mod: 'treeVisualizer',        import: () => import('../visualizer/tree.js'),        defaultOp: null },
  'binary-tree':        { mod: 'treeVisualizer',        import: () => import('../visualizer/tree.js'),        defaultOp: null },
  'binary-search-tree': { mod: 'treeVisualizer',        import: () => import('../visualizer/tree.js'),        defaultOp: null },
  'graph':              { mod: 'graphVisualizer',       import: () => import('../visualizer/graph.js'),       defaultOp: null },
  'bfs':                { mod: 'graphVisualizer',       import: () => import('../visualizer/graph.js'),       defaultOp: 'BFS Traversal' },
  'dfs':                { mod: 'graphVisualizer',       import: () => import('../visualizer/graph.js'),       defaultOp: 'DFS Traversal' },
  'dynamic-programming':{ mod: 'dpVisualizer',          import: () => import('../visualizer/dp.js'),          defaultOp: null },
  'recursion':          { mod: 'dpVisualizer',          import: () => import('../visualizer/dp.js'),          defaultOp: null },
  'strings':            { mod: 'arrayVisualizer',       import: () => import('../visualizer/array.js'),       defaultOp: 'Traversal' },
};

// Slug keyword fallback for URL-only problems
const SLUG_KEYWORD_MAP = {
  'sort': 'sorting', 'search': 'binary-search', 'tree': 'tree', 'graph': 'graph',
  'stack': 'stack', 'queue': 'queue', 'linked': 'linked-list', 'list': 'linked-list',
  'bfs': 'bfs', 'dfs': 'dfs', 'dp': 'dynamic-programming', 'dynamic': 'dynamic-programming',
  'array': 'arrays', 'two-sum': 'arrays', 'sum': 'arrays', 'subarray': 'arrays',
  'sliding': 'sliding-window', 'window': 'sliding-window', 'pointer': 'two-pointers',
  'matrix': 'arrays', 'string': 'strings', 'palindrome': 'strings',
  'parenthes': 'stack', 'bracket': 'stack', 'valid': 'stack',
  'climb': 'dynamic-programming', 'stair': 'dynamic-programming', 'fibonacci': 'dynamic-programming',
  'knapsack': 'dynamic-programming', 'coin': 'dynamic-programming',
  'inorder': 'tree', 'preorder': 'tree', 'postorder': 'tree', 'bst': 'binary-search-tree',
};

function detectVizConfig(problem, slug) {
  // 1. Try from problem topics
  if (problem?.topics) {
    for (const topic of problem.topics) {
      if (TOPIC_TO_VIZ[topic]) return TOPIC_TO_VIZ[topic];
    }
  }
  // 2. Try from slug keywords
  const s = (slug || '').toLowerCase();
  for (const [keyword, topic] of Object.entries(SLUG_KEYWORD_MAP)) {
    if (s.includes(keyword) && TOPIC_TO_VIZ[topic]) return TOPIC_TO_VIZ[topic];
  }
  // 3. Default to array
  return TOPIC_TO_VIZ['arrays'];
}

export function render(container, params) {
  const problemId = params?.id;
  const url = params?.url ? decodeURIComponent(params.url) : null;
  const slug = params?.slug ? decodeURIComponent(params.slug) : null;

  const problem = problemId ? problemService.getById(problemId) : null;
  const title = problem ? problem.title : (slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Problem');
  const source = url ? (url.includes('leetcode') ? 'LeetCode' : url.includes('geeksforgeeks') ? 'GeeksforGeeks' : '') : (problem?.source || '');

  let explanation = '';
  let isLoadingExplanation = true;
  let chatMessages = [];
  let isChatTyping = false;
  let speakingMsgIdx = -1;

  // ── Visualizer state ──
  let vizModule = null;
  let vizLoaded = false;
  let vizSteps = [];
  let vizStepIdx = 0;
  let vizPlaying = false;
  let vizTimer = null;
  let vizSpeed = 700;
  let vizOperation = null;
  let vizConfig = detectVizConfig(problem, slug || problemId);
  let resizeObserver = null;
  let vizAudioGuide = store.get('settings.audioGuide') || false;
  let showVizPanel = false; // Collapsed by default to avoid clumsiness

  function renderPage() {
    const apiKey = store.get('settings.apiKey');
    if (apiKey) ai.setApiKey(apiKey);
    const user = store.get('user');
    if (user) ai.setUserContext(user);

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;min-height:calc(100vh - 70px);">
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-shrink:0;">
          <button onclick="history.back()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:4px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style="flex:1;min-width:0;">
            <h1 style="font-size:1rem;font-weight:700;color:var(--text-primary);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(title)}</h1>
            <div style="display:flex;gap:6px;align-items:center;">
              ${source ? `<span style="font-size:11px;color:var(--text-muted);">${source}</span>` : ''}
              ${problem?.difficulty ? `<span class="badge badge-${problem.difficulty}">${problem.difficulty}</span>` : ''}
            </div>
          </div>
          ${speech.supported ? `
          <button class="btn btn-icon" id="btn-speak-all" title="Read explanation aloud" style="flex-shrink:0;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>` : ''}
        </div>

        ${!store.get('settings.apiKey') ? `
        <div style="background:var(--warning-muted);border:1px solid rgba(217,119,6,0.2);border-radius:var(--radius-md);padding:8px 12px;margin-bottom:10px;flex-shrink:0;font-size:11px;color:var(--text-secondary);">
          No API key — using demo responses. <a href="#profile" style="color:var(--accent);">Add key →</a>
        </div>` : ''}

        <!-- ═══ RESPONSIVE SPLIT GRID LAYOUT ═══ -->
        <div class="learn-grid">
          
          <!-- Left Column: Problem details, explanations, code solution -->
          <div class="learn-left-column">
            <!-- AI Explanation -->
            <div class="card" style="margin-bottom:12px;flex-shrink:0;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                <span style="font-size:11px;font-weight:600;color:var(--text-muted);display:flex;align-items:center;gap:6px;">
                  AI EXPLANATION
                  <select id="select-expl-lang" style="font-size:10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);padding:2px 4px;outline:none;cursor:pointer;">
                    <option value="english" ${store.get('settings.explanationLanguage')==='english'?'selected':''}>English</option>
                    <option value="hinglish" ${store.get('settings.explanationLanguage')==='hinglish'?'selected':''}>Hinglish</option>
                    <option value="hindi" ${store.get('settings.explanationLanguage')==='hindi'?'selected':''}>हिन्दी (Hindi)</option>
                  </select>
                </span>
                <div style="display:flex;gap:4px;">
                  ${explanation && speech.supported ? `
                  <button class="btn btn-ghost speak-btn" data-text="explanation" title="Listen" style="padding:4px 8px;font-size:11px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    Listen
                  </button>` : ''}
                  ${explanation ? `<button class="btn btn-ghost" id="btn-regenerate" style="padding:4px 8px;font-size:11px;">Regenerate</button>` : ''}
                </div>
              </div>
              <div id="explanation-content" style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.7;">
                ${isLoadingExplanation
                  ? '<div style="display:flex;flex-direction:column;gap:8px;"><div class="skeleton" style="height:16px;width:80%;"></div><div class="skeleton" style="height:16px;width:60%;"></div><div class="skeleton" style="height:16px;width:90%;"></div><div class="skeleton" style="height:16px;width:50%;"></div><div class="skeleton" style="height:80px;"></div></div>'
                  : renderMarkdown(explanation)}
              </div>
            </div>

            ${problem ? renderSolutionSection(problem) : ''}
          </div>

          <!-- Right Column: Animated visualizer, AI Tutor chat widget -->
          <div class="learn-right-column">
            <!-- ═══ ANIMATED VISUALIZATION ═══ -->
            <div class="card" style="margin-bottom:12px;flex-shrink:0;" id="viz-section">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${showVizPanel ? '8px' : '0'};">
                <span style="font-size:11px;font-weight:600;color:var(--text-muted);">STEP-BY-STEP ANIMATION</span>
                <button class="btn btn-secondary" id="btn-toggle-viz-panel" style="padding:4px 10px;font-size:11px;height:24px;line-height:1;margin:0;">
                  ${showVizPanel ? 'Hide Simulation' : 'Show Simulation'}
                </button>
              </div>

              ${showVizPanel ? (vizLoaded && vizModule ? renderVizControls() : `
                <div style="text-align:center;padding:20px;">
                  <div class="loading-spinner" style="margin:0 auto 8px;"></div>
                  <p style="font-size:12px;color:var(--text-muted);">Loading visualization...</p>
                </div>
              `) : ''}
            </div>

            <!-- AI Tutor Chat card -->
            <div class="card" style="margin-bottom:12px; display:flex; flex-direction:column; gap:8px;">
              <div style="font-size:11px;font-weight:600;color:var(--text-muted);">AI TUTOR CHAT</div>
              
              <div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none;" id="quick-prompts">
                ${getQuickPrompts(title).map(p => `<button class="quick-prompt-btn" data-prompt="${escHtml(p)}">${p}</button>`).join('')}
              </div>

              <!-- Messages -->
              <div id="chat-messages" style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;padding-right:4px;scrollbar-width:thin;">
                ${chatMessages.map((msg, idx) => renderChatMsg(msg, idx)).join('')}
                ${isChatTyping ? `<div class="message-row ai"><div class="ai-avatar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div class="chat-bubble chat-bubble-ai"><span class="typing-dot"></span><span class="typing-dot" style="animation-delay:.15s;"></span><span class="typing-dot" style="animation-delay:.3s;"></span></div></div>` : ''}
              </div>

              <!-- Input Bar -->
              <div class="chat-input-bar">
                <textarea id="chat-input" placeholder="Ask about this problem..." rows="1"
                  style="flex:1;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-md);padding:9px 12px;color:var(--text-primary);font-family:Inter,sans-serif;font-size:var(--text-sm);resize:none;outline:none;max-height:80px;overflow-y:auto;"></textarea>
                <button class="btn btn-primary" id="send-btn" style="padding:9px 14px; display:flex; align-items:center; justify-content:center;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    `;

    attachEvents();
    initVizCanvas();
    scrollChatToBottom();
  }

  // ── Visualizer rendering ──

  function renderVizControls() {
    const ops = vizModule.operations || [];
    const step = vizSteps[vizStepIdx];
    const pct = vizSteps.length > 0 ? ((vizStepIdx + 1) / vizSteps.length) * 100 : 0;

    return `
      <!-- Operation selector -->
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
        ${ops.map(op => `<button class="chip viz-op-btn ${vizOperation === op ? 'active' : ''}" data-op="${op}" style="font-size:11px;padding:4px 10px;">${op}</button>`).join('')}
      </div>

      <!-- Canvas -->
      <div style="position:relative;margin-bottom:8px;">
        <canvas id="viz-canvas" width="800" height="280" style="width:100%;height:auto;border-radius:var(--radius-md);background:var(--bg-secondary);display:block;"></canvas>
      </div>

      <!-- Step info + code -->
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
        <div style="flex:1;min-width:150px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:10px;color:var(--text-muted);">Step ${vizStepIdx + 1} / ${vizSteps.length}</span>
          </div>
          <div class="progress-bar" style="height:4px;margin-bottom:6px;"><div class="progress-fill" style="width:${pct}%;transition:width 0.2s;"></div></div>
          <div style="font-size:12px;color:var(--accent);font-weight:500;min-height:18px;">${step?.message || ''}</div>
        </div>
        ${step?.code ? `
        <div style="flex:1;min-width:150px;">
          <pre style="background:#111113;border:1px solid var(--border);border-radius:6px;padding:6px 10px;font-family:JetBrains Mono,Consolas,monospace;font-size:11px;color:#a5b4fc;margin:0;overflow-x:auto;white-space:pre-wrap;">${escHtml(step.code)}</pre>
        </div>` : ''}
      </div>

      ${step?.variables && Object.keys(step.variables).length ? `
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">
        ${Object.entries(step.variables).map(([k, v]) => `<span style="font-size:10px;background:var(--bg-secondary);border:1px solid var(--border);padding:2px 6px;border-radius:4px;font-family:monospace;color:var(--text-muted);">${k}=${JSON.stringify(v)}</span>`).join('')}
      </div>` : ''}

      <!-- Playback controls -->
      <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:6px;">
        <button class="btn btn-icon viz-ctrl" data-action="first" title="First step" style="width:32px;height:32px;font-size:12px;">⏮</button>
        <button class="btn btn-icon viz-ctrl" data-action="prev" title="Previous" style="width:32px;height:32px;font-size:14px;">◀</button>
        <button class="btn btn-primary viz-ctrl" data-action="play" style="min-width:70px;padding:6px 14px;font-size:12px;">${vizPlaying ? 'Pause' : 'Play'}</button>
        <button class="btn btn-icon viz-ctrl" data-action="next" title="Next" style="width:32px;height:32px;font-size:14px;">▶</button>
        <button class="btn btn-icon viz-ctrl" data-action="last" title="Last step" style="width:32px;height:32px;font-size:12px;">⏭</button>
        <button class="btn ${vizAudioGuide ? 'btn-primary' : 'btn-secondary'} viz-ctrl" data-action="audioguide" title="Toggle AI voice step guide" style="width:32px;height:32px;padding:0;display:inline-flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${vizAudioGuide ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </button>
      </div>

      <!-- Speed slider -->
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:10px;color:var(--text-muted);">Slow</span>
        <input type="range" id="viz-speed" min="100" max="6000" value="${6100 - vizSpeed}" step="100" style="flex:1;accent-color:var(--accent);height:4px;" />
        <span style="font-size:10px;color:var(--text-muted);">Fast</span>
      </div>
    `;
  }

  function initVizCanvas() {
    const canvas = container.querySelector('#viz-canvas');
    if (!canvas || !vizModule) return;
    const ctx = canvas.getContext('2d');

    if (resizeObserver) resizeObserver.disconnect();

    resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        const w = rect.width;
        if (w > 0) {
          const h = Math.max(280, w * 0.5);
          const dpr = window.devicePixelRatio || 1;
          canvas.width = w * dpr;
          canvas.height = h * dpr;
          canvas.style.height = h + 'px';
          ctx.scale(dpr, dpr);
          drawVizStep(canvas, ctx);
        }
      }
    });

    resizeObserver.observe(canvas);
  }

  function drawVizStep(canvas, ctx) {
    if (!canvas || !ctx || !vizModule || !vizSteps.length) return;
    const w = canvas.getBoundingClientRect().width || (canvas.width / (window.devicePixelRatio || 1));
    const h = canvas.getBoundingClientRect().height || (canvas.height / (window.devicePixelRatio || 1));
    if (w > 0) {
      ctx.clearRect(0, 0, w, h);
      try { vizModule.render(ctx, vizSteps[vizStepIdx], w, h); }
      catch (e) { /* silent */ }
    }
  }

  function updateVizUI() {
    const step = vizSteps[vizStepIdx];
    const canvas = container.querySelector('#viz-canvas');
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) drawVizStep(canvas, ctx);

    // Sound effect & Spoken voice guidance
    playSoundForStep(step, vizStepIdx, vizSteps.length);
    // Only speak on manual step if NOT playing (to avoid double speaking when playing)
    if (!vizPlaying && vizAudioGuide && step?.message) {
      speech.speak(getFriendlyExplanation(step)).catch(() => {});
    }

    // Update step counter + message
    const pct = vizSteps.length > 0 ? ((vizStepIdx + 1) / vizSteps.length) * 100 : 0;
    const vizSection = container.querySelector('#viz-section');
    if (!vizSection) return;

    const progFill = vizSection.querySelector('.progress-fill');
    if (progFill) progFill.style.width = pct + '%';

    const stepInfos = vizSection.querySelectorAll('[style*="font-size:10px;color:var(--text-muted)"]');
    if (stepInfos[0]) stepInfos[0].textContent = `Step ${vizStepIdx + 1} / ${vizSteps.length}`;

    const msgEl = vizSection.querySelector('[style*="font-size:12px;color:var(--accent)"]');
    if (msgEl) msgEl.textContent = step?.message || '';
  }

  function startVizPlay() {
    clearVizTimer();
    playNextVizStep();
  }

  function playNextVizStep() {
    if (!vizPlaying) return;
    if (vizStepIdx >= vizSteps.length - 1) {
      clearVizTimer();
      vizPlaying = false;
      const btn = container.querySelector('[data-action="play"]');
      if (btn) btn.textContent = 'Play';
      return;
    }

    vizStepIdx++;
    updateVizUI();

    const step = vizSteps[vizStepIdx];
    if (vizAudioGuide && step && step.message) {
      const friendlyText = getFriendlyExplanation(step);
      speech.speak(friendlyText)
        .then(() => {
          vizTimer = setTimeout(() => {
            playNextVizStep();
          }, 800);
        })
        .catch(() => {
          vizTimer = setTimeout(() => {
            playNextVizStep();
          }, vizSpeed);
        });
    } else {
      vizTimer = setTimeout(() => {
        playNextVizStep();
      }, vizSpeed);
    }
  }

  function clearVizTimer() { if (vizTimer) { clearTimeout(vizTimer); vizTimer = null; } }

  // ── Solution section ──

  function renderSolutionSection(p) {
    const lang = store.get('settings.language') || 'python';
    let code = '';
    if (lang === 'c') {
      const cppCode = p.solutions?.cpp?.optimal || p.solutions?.cpp?.brute || '';
      code = cppCode
        .replace(/std::/g, '')
        .replace(/vector<int>&/g, 'int*')
        .replace(/vector<int>/g, 'int*')
        .replace(/unordered_map<[^>]+>/g, 'Map')
        .replace(/cout\s*<</g, 'printf')
        .replace(/#include <iostream>/g, '#include <stdio.h>\n#include <stdlib.h>')
        .trim();
      if (!code) code = '// Select Python, JavaScript or C++ for this solution';
    } else {
      code = p.solutions?.[lang]?.optimal || p.solutions?.python?.optimal || '';
    }
    const complexity = p.complexity?.optimal || {};
    if (!code) return '';
    return `
      <div class="card" style="margin-bottom:12px;flex-shrink:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
          <div style="display:flex;gap:4px;" id="sol-lang-chips">
            ${['python', 'javascript', 'cpp', 'c'].map(l => `
              <button class="chip lang-select-btn ${lang === l ? 'active' : ''}" data-lang="${l}" style="font-size:10px;padding:2px 8px;">
                ${{ python: 'Python', javascript: 'JavaScript', cpp: 'C++', c: 'C' }[l]}
              </button>
            `).join('')}
          </div>
          <div style="display:flex;gap:4px;">
            ${complexity.time ? `<span style="font-size:10px;background:var(--bg-secondary);padding:2px 6px;border-radius:4px;color:var(--text-muted);font-family:monospace;">${complexity.time}</span>` : ''}
            ${complexity.space ? `<span style="font-size:10px;background:var(--bg-secondary);padding:2px 6px;border-radius:4px;color:var(--text-muted);font-family:monospace;">${complexity.space}</span>` : ''}
          </div>
        </div>
        <div class="code-block" style="position:relative;">
          <button id="copy-code" style="position:absolute;top:6px;right:6px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;padding:2px 8px;font-size:10px;cursor:pointer;color:var(--text-muted);">Copy</button>
          <pre style="margin:0;white-space:pre-wrap;font-size:12px;line-height:1.6;color:#e2e8f0;">${escHtml(code)}</pre>
        </div>
      </div>`;
  }

  // ── Chat message rendering ──

  function renderChatMsg(msg, idx) {
    const isUser = msg.role === 'user';
    const isSpeaking = speakingMsgIdx === idx;
    return `
      <div class="message-row ${isUser ? 'user' : 'ai'}">
        ${!isUser ? '<div class="ai-avatar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>' : ''}
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

  function getQuickPrompts() {
    return [
      'Explain step by step',
      "What's the time complexity?",
      'Give me a hint',
      'Simpler approach?',
      'Edge cases?',
      'Why use this data structure?',
    ];
  }

  // ── AI calls ──

  async function loadExplanation() {
    isLoadingExplanation = true;
    renderPage();

    try {
      if (problem) {
        explanation = await ai.explainProblem(problem);
      } else if (url && slug) {
        explanation = await ai.explainFromUrl(url, slug);
      } else {
        explanation = 'Could not identify the problem. Please paste a valid LeetCode or GeeksforGeeks link.';
      }
    } catch (e) {
      explanation = 'Failed to generate explanation. Check your API key and try again.';
    }

    isLoadingExplanation = false;
    store.update('progress.aiQuestionsAsked', n => (n || 0) + 1);
    gamification.checkBadges();
    renderPage();
  }

  async function sendChat(text) {
    if (!text.trim() || isChatTyping) return;
    chatMessages.push({ role: 'user', content: text.trim() });
    isChatTyping = true;
    renderPage();

    try {
      const contextMsgs = [
        { role: 'ai', content: `I just explained the problem "${title}". Here's my explanation:\n\n${explanation?.slice(0, 500)}...` },
        ...chatMessages.slice(-10),
      ];
      const response = await ai.tutorChat(contextMsgs, problem);
      chatMessages.push({ role: 'ai', content: response });
      store.update('progress.aiQuestionsAsked', n => (n || 0) + 1);
    } catch (e) {
      chatMessages.push({ role: 'ai', content: 'Something went wrong. Please try again.' });
    }

    isChatTyping = false;
    renderPage();
  }

  // ── Load visualizer module ──

  async function loadViz() {
    try {
      const imported = await vizConfig.import();
      vizModule = imported[vizConfig.mod];
      
      // Map specific problem IDs to specific operations and inputs
      let op = vizConfig.defaultOp;
      let customInput = null;
      
      if (problem) {
        if (problem.id === 'two-sum') {
          op = 'Two Pointer';
          customInput = [2, 7, 11, 15]; // Two Sum default inputs
        } else if (problem.id === 'binary-search') {
          op = 'Binary Search';
          customInput = [1, 3, 5, 7, 9, 11, 13];
        } else if (problem.id === 'reverse-linked-list') {
          op = 'Reverse';
        } else if (problem.id === 'valid-parentheses') {
          op = 'Push'; // Stack pushes brackets
        } else if (problem.id === 'climbing-stairs') {
          op = 'Fibonacci (1D DP)';
        } else if (problem.id === 'coin-change') {
          op = 'Coin Change (1D DP)';
        } else if (problem.id === 'valid-palindrome') {
          op = 'Two Pointer';
        } else if (problem.id === 'sliding-window-maximum' || problem.id === 'longest-substring-without-repeating-characters') {
          op = 'Sliding Window';
        } else if (problem.id === 'merge-two-sorted-lists') {
          op = 'Insert at Tail';
        } else if (problem.id === 'invert-binary-tree') {
          op = 'BST Insert';
        } else if (problem.id === 'number-of-islands' || problem.id === 'course-schedule') {
          op = 'BFS';
        } else if (problem.id === 'dijkstra-algorithm') {
          op = 'Dijkstra';
        }
      }

      if (vizModule?.operations?.length) {
        vizOperation = op || vizModule.operations[0];
        vizSteps = vizModule.generateSteps(vizOperation, customInput);
      }
      vizLoaded = true;
      vizStepIdx = 0;
      store.update('progress.visualizationsWatched', n => (n || 0) + 1);
    } catch (e) {
      console.error('Viz load error:', e);
      vizLoaded = true; // still mark loaded so we don't show spinner forever
      vizModule = null;
    }
    renderPage();
  }

  function attachEvents() {
    container.querySelector('#select-expl-lang')?.addEventListener('change', (e) => {
      const selected = e.target.value;
      store.set('settings.explanationLanguage', selected);
      loadExplanation();
    });

    const input = container.querySelector('#chat-input');
    const sendBtn = container.querySelector('#send-btn');

    if (input) {
      input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 80) + 'px'; });
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const t = input.value.trim(); if (t) { sendChat(t); input.value = ''; input.style.height = 'auto'; } }
      });
    }
    if (sendBtn) sendBtn.addEventListener('click', () => { if (!input) return; const t = input.value.trim(); if (t) { sendChat(t); input.value = ''; input.style.height = 'auto'; } });

    // Quick prompts
    container.querySelectorAll('.quick-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => sendChat(btn.dataset.prompt));
    });

    // TTS
    container.querySelector('#btn-speak-all')?.addEventListener('click', () => {
      if (speech.isSpeaking) { speech.stop(); return; }
      if (explanation) { speech.speak(explanation).catch(() => {}); showToast('Speaking...', 'info', 2000); }
    });
    container.querySelector('.speak-btn[data-text="explanation"]')?.addEventListener('click', () => {
      if (speech.isSpeaking) { speech.stop(); return; }
      if (explanation) speech.speak(explanation).catch(() => {});
    });
    container.querySelectorAll('.speak-msg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        if (speakingMsgIdx === idx) { speech.stop(); speakingMsgIdx = -1; renderPage(); return; }
        speech.stop(); speakingMsgIdx = idx; renderPage();
        const msg = chatMessages[idx];
        if (msg) speech.speak(msg.content).then(() => { speakingMsgIdx = -1; renderPage(); }).catch(() => { speakingMsgIdx = -1; renderPage(); });
      });
    });

    // Regenerate
    container.querySelector('#btn-regenerate')?.addEventListener('click', () => loadExplanation());

    // Copy code
    container.querySelector('#copy-code')?.addEventListener('click', () => {
      const lang = store.get('settings.language') || 'python';
      let code = '';
      if (lang === 'c') {
        const cppCode = problem?.solutions?.cpp?.optimal || '';
        code = cppCode
          .replace(/std::/g, '')
          .replace(/vector<int>&/g, 'int*')
          .replace(/vector<int>/g, 'int*')
          .replace(/unordered_map<[^>]+>/g, 'Map')
          .replace(/cout\s*<</g, 'printf')
          .replace(/#include <iostream>/g, '#include <stdio.h>\n#include <stdlib.h>')
          .trim();
      } else {
        code = problem?.solutions?.[lang]?.optimal || '';
      }
      navigator.clipboard.writeText(code).then(() => {
        const btn = container.querySelector('#copy-code');
        if (btn) { btn.textContent = 'Copied'; setTimeout(() => { if (btn) btn.textContent = 'Copy'; }, 1500); }
      });
    });

    // Language selection in solution
    container.querySelectorAll('.lang-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedLang = btn.dataset.lang;
        store.set('settings.language', selectedLang);
        store.update('user', u => {
          if (u) u.language = selectedLang;
          return u;
        });
        renderPage();
      });
    });

    // ── Visualizer Panel Toggle ──
    container.querySelector('#btn-toggle-viz-panel')?.addEventListener('click', () => {
      showVizPanel = !showVizPanel;
      if (!showVizPanel) {
        clearVizTimer();
        speech.stop();
        vizPlaying = false;
      }
      renderPage();
    });

    // ── Visualizer controls ──
    container.querySelectorAll('.viz-op-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        clearVizTimer(); vizPlaying = false;
        vizOperation = btn.dataset.op;
        try { vizSteps = vizModule.generateSteps(vizOperation, null); } catch (e) { vizSteps = []; }
        vizStepIdx = 0;
        renderPage();
      });
    });

    container.querySelectorAll('.viz-ctrl').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'play') {
          vizPlaying = !vizPlaying;
          btn.textContent = vizPlaying ? 'Pause' : 'Play';
          if (vizPlaying) { if (vizStepIdx >= vizSteps.length - 1) vizStepIdx = 0; startVizPlay(); }
          else {
            clearVizTimer();
            speech.stop();
          }
        } else if (action === 'first') { clearVizTimer(); vizPlaying = false; speech.stop(); vizStepIdx = 0; updateVizUI(); }
        else if (action === 'prev') { clearVizTimer(); vizPlaying = false; speech.stop(); vizStepIdx = Math.max(0, vizStepIdx - 1); updateVizUI(); }
        else if (action === 'next') { clearVizTimer(); vizPlaying = false; speech.stop(); vizStepIdx = Math.min(vizSteps.length - 1, vizStepIdx + 1); updateVizUI(); }
        else if (action === 'last') { clearVizTimer(); vizPlaying = false; speech.stop(); vizStepIdx = vizSteps.length - 1; updateVizUI(); }
        else if (action === 'audioguide') {
          vizAudioGuide = !vizAudioGuide;
          store.set('settings.audioGuide', vizAudioGuide);
          if (!vizAudioGuide) speech.stop();
          renderPage();
        }
      });
    });

    container.querySelector('#viz-speed')?.addEventListener('input', e => { vizSpeed = 6100 - parseInt(e.target.value); });
  }

  function scrollChatToBottom() {
    const msgs = container.querySelector('#chat-messages');
    if (msgs) setTimeout(() => msgs.scrollIntoView({ block: 'end', behavior: 'smooth' }), 50);
  }

  // ── Initialize ──
  renderPage();
  loadExplanation();
  loadViz();

  return () => { speech.stop(); clearVizTimer(); if (resizeObserver) resizeObserver.disconnect(); };
}
