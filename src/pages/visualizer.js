import { store } from '../store.js';
import { showToast } from '../components/toast.js';
import { sound } from '../services/sound.js';
import { speech } from '../services/speech.js';
import { ai } from '../services/ai.js';

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

let visualizerModules = null;
async function loadVisualizers() {
  if (visualizerModules) return visualizerModules;
  const [{ arrayVisualizer }, { linkedListVisualizer }, { treeVisualizer }, { graphVisualizer }, { stackQueueVisualizer }, { dpVisualizer }] = await Promise.all([
    import('../visualizer/array.js'), import('../visualizer/linkedlist.js'), import('../visualizer/tree.js'),
    import('../visualizer/graph.js'), import('../visualizer/stack-queue.js'), import('../visualizer/dp.js'),
  ]);
  visualizerModules = { arrayVisualizer, linkedListVisualizer, treeVisualizer, graphVisualizer, stackQueueVisualizer, dpVisualizer };
  return visualizerModules;
}

const VIZ_LIST = [
  { id: 'array', name: 'Arrays', icon: '[ ]', module: 'arrayVisualizer' },
  { id: 'linkedlist', name: 'Linked List', icon: '→', module: 'linkedListVisualizer' },
  { id: 'tree', name: 'Binary Tree', icon: '△', module: 'treeVisualizer' },
  { id: 'graph', name: 'Graph', icon: '◇', module: 'graphVisualizer' },
  { id: 'stack-queue', name: 'Stack/Queue', icon: '▐', module: 'stackQueueVisualizer' },
  { id: 'dp', name: 'DP', icon: '▦', module: 'dpVisualizer' },
];

export function render(container) {
  let activeViz = 'array', activeOperation = null, steps = [], stepIndex = 0, playing = false, playTimer = null, speed = 800;
  let vizAudioGuide = store.get('settings.audioGuide') || false;
  let canvas = null, ctx = null, currentModule = null;
  let resizeObserver = null;
  
  // Chat state
  let chatMessages = [];
  let isChatTyping = false;
  let speakingMsgIdx = -1;

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

  async function sendChat(text) {
    if (!text.trim() || isChatTyping) return;
    chatMessages.push({ role: 'user', content: text.trim() });
    isChatTyping = true;
    renderVizBody();
    scrollChat();

    try {
      const currentStep = steps[stepIndex];
      const infoText = `The student is currently watching the algorithm visualizer for "${activeViz}" (Operation: "${activeOperation}"). Current step: ${stepIndex + 1} of ${steps.length}. Step message: "${currentStep?.message || ''}".`;
      const contextMsgs = [
        { role: 'ai', content: `Understood. ${infoText}` },
        ...chatMessages.slice(-10)
      ];
      const response = await ai.tutorChat(contextMsgs, null);
      chatMessages.push({ role: 'ai', content: response });
      store.update('progress.aiQuestionsAsked', n => (n || 0) + 1);
    } catch (e) {
      chatMessages.push({ role: 'ai', content: 'Something went wrong, bhai. Please try again.' });
    }

    isChatTyping = false;
    renderVizBody();
    scrollChat();
  }

  function scrollChat() {
    const msgs = container.querySelector('#chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  function renderPage() {
    container.innerHTML = `
      <div class="visualizer-page">
        <div class="page-header">
          <h1>Visualizer</h1>
          <span style="font-size:11px;color:var(--text-muted);">Step-by-step execution</span>
        </div>
        <div class="ds-selector">
          ${VIZ_LIST.map(v => `
            <div class="ds-item ${activeViz === v.id ? 'active' : ''}" data-ds="${v.id}">
              <span class="ds-icon" style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:700;">${v.icon}</span>
              <span class="ds-name">${v.name}</span>
            </div>`).join('')}
        </div>
        <div id="viz-body">
          <div class="card" style="text-align:center;padding:24px;">
            <div class="loading-spinner"></div>
            <p style="margin-top:8px;color:var(--text-muted);font-size:12px;">Loading...</p>
          </div>
        </div>
      </div>`;
    container.querySelectorAll('.ds-item').forEach(item => {
      item.addEventListener('click', () => { clearTimer(); playing = false; activeViz = item.dataset.ds; activeOperation = null; currentModule = null; chatMessages = []; renderPage(); loadAndRender(); });
    });
    loadAndRender();
  }

  async function loadAndRender() {
    try {
      const mods = await loadVisualizers();
      currentModule = mods[VIZ_LIST.find(v => v.id === activeViz).module];
      if (!activeOperation && currentModule?.operations?.length) activeOperation = currentModule.operations[0];
      generateSteps();
      renderVizBody();
      store.update('progress.visualizationsWatched', n => (n||0)+1);
    } catch (e) {
      document.querySelector('#viz-body').innerHTML = `<div class="card" style="text-align:center;padding:16px;color:var(--error);font-size:12px;">Failed to load: ${e.message}</div>`;
    }
  }

  function generateSteps() {
    if (!currentModule) return;
    try { steps = currentModule.generateSteps(activeOperation, null); } catch(e) { steps = []; }
    stepIndex = 0; playing = false; clearTimer();
  }

  function renderVizBody() {
    const vizBody = container.querySelector('#viz-body');
    if (!vizBody) return;
    const ops = currentModule?.operations || [];
    const currentStep = steps[stepIndex];

    vizBody.innerHTML = `
      <div class="card" style="margin-bottom:8px;">
        <div style="font-size:10px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">OPERATION</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${ops.map(op => `<button class="chip op-btn ${activeOperation === op ? 'active' : ''}" data-op="${op}">${op}</button>`).join('')}
        </div>
      </div>
      <div class="card" style="margin-bottom:8px;padding:8px;">
        <canvas id="viz-canvas" width="800" height="300" style="width:100%;height:auto;border-radius:var(--radius-md);background:var(--bg-secondary);"></canvas>
      </div>
      <div class="card" style="margin-bottom:8px;padding:10px 12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:11px;color:var(--text-muted);">Step ${stepIndex+1} / ${steps.length}</span>
          <span id="step-msg" style="font-size:12px;color:var(--accent);font-weight:500;">${currentStep?.message||''}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${steps.length>0?((stepIndex+1)/steps.length)*100:0}%;"></div></div>
      </div>
      <div class="viz-controls" style="display:flex;align-items:center;justify-content:center;gap:6px;">
        <button class="btn btn-icon" id="btn-first">⏮</button>
        <button class="btn btn-icon" id="btn-prev">◀</button>
        <button class="btn btn-primary" id="btn-play" style="min-width:80px;font-size:12px;">${playing ? 'Pause' : 'Play'}</button>
        <button class="btn btn-icon" id="btn-next-step">▶</button>
        <button class="btn btn-icon" id="btn-last">⏭</button>
        <button class="btn ${vizAudioGuide ? 'btn-primary' : 'btn-secondary'}" id="btn-audioguide" title="Toggle AI voice step guide" style="width:32px;height:32px;padding:0;display:inline-flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${vizAudioGuide ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </button>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 0;">
        <span style="font-size:10px;color:var(--text-muted);">Slow</span>
        <input type="range" id="speed-slider" min="100" max="6000" value="${6100-speed}" step="100" style="flex:1;accent-color:var(--accent);" />
        <span style="font-size:10px;color:var(--text-muted);">Fast</span>
      </div>
      <div id="edu-info" style="margin-top:4px;"></div>
      
      <!-- AI Integration to Ask Doubts -->
      <div class="card" style="margin-top:12px;">
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;display:flex;align-items:center;gap:6px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ASK CODENATOR AI (YOUR DOUBTS)
        </div>
        
        <div id="chat-messages" style="display:flex;flex-direction:column;gap:8px;max-height:200px;overflow-y:auto;padding-right:4px;margin-bottom:8px;scrollbar-width:thin;">
          ${chatMessages.length === 0 ? `
            <div style="text-align:center;padding:16px;color:var(--text-muted);font-size:12px;">
              Ask CodeMentor AI any doubts about this visualization or algorithm steps!
            </div>
          ` : chatMessages.map((msg, idx) => renderChatMsg(msg, idx)).join('')}
          ${isChatTyping ? `
            <div class="message-row ai">
              <div class="ai-avatar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
              <div class="chat-bubble chat-bubble-ai"><span class="typing-dot"></span><span class="typing-dot" style="animation-delay:.15s;"></span><span class="typing-dot" style="animation-delay:.3s;"></span></div>
            </div>
          ` : ''}
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
          ${['Explain this step', 'What is the time complexity?', 'Explain in simple words', 'Any edge cases?'].map(q => `
            <button class="chip quick-prompt-btn" style="font-size:10px;padding:4px 8px;cursor:pointer;">${q}</button>
          `).join('')}
        </div>

        <div style="display:flex;gap:6px;">
          <input class="input" id="chat-input" placeholder="Ask a doubt about ${activeViz}..." style="flex:1;font-size:12px;padding:8px 12px;height:36px;" />
          <button class="btn btn-primary" id="btn-send-chat" style="padding:0 14px;height:36px;font-size:12px;">Send</button>
        </div>
      </div>`;

    canvas = vizBody.querySelector('#viz-canvas');
    if (canvas) {
      ctx = canvas.getContext('2d');
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
            drawCurrentStep();
          }
        }
      });
      resizeObserver.observe(canvas);
    }

    vizBody.querySelectorAll('.op-btn').forEach(b => b.addEventListener('click', () => { clearTimer(); playing = false; activeOperation = b.dataset.op; generateSteps(); renderVizBody(); }));
    vizBody.querySelector('#btn-play')?.addEventListener('click', () => {
      playing = !playing;
      vizBody.querySelector('#btn-play').textContent = playing ? 'Pause' : 'Play';
      if (playing) {
        if (stepIndex >= steps.length-1) stepIndex = 0;
        startPlay();
      } else {
        clearTimer();
        speech.stop();
      }
    });
    vizBody.querySelector('#btn-first')?.addEventListener('click', () => { clearTimer(); playing = false; speech.stop(); stepIndex = 0; update(); });
    vizBody.querySelector('#btn-prev')?.addEventListener('click', () => { clearTimer(); playing = false; speech.stop(); stepIndex = Math.max(0, stepIndex-1); update(); });
    vizBody.querySelector('#btn-next-step')?.addEventListener('click', () => { clearTimer(); playing = false; speech.stop(); stepIndex = Math.min(steps.length-1, stepIndex+1); update(); });
    vizBody.querySelector('#btn-last')?.addEventListener('click', () => { clearTimer(); playing = false; speech.stop(); stepIndex = steps.length-1; update(); });
    vizBody.querySelector('#speed-slider')?.addEventListener('input', (e) => { speed = 6100 - parseInt(e.target.value); });
    vizBody.querySelector('#btn-audioguide')?.addEventListener('click', () => {
      vizAudioGuide = !vizAudioGuide;
      store.set('settings.audioGuide', vizAudioGuide);
      if (!vizAudioGuide) speech.stop();
      renderVizBody();
    });

    // Chat Events Attachment
    vizBody.querySelectorAll('.quick-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sendChat(btn.textContent.trim());
      });
    });

    const chatInput = vizBody.querySelector('#chat-input');
    const sendBtn = vizBody.querySelector('#btn-send-chat');
    
    const handleSend = () => {
      const val = chatInput?.value.trim();
      if (val) {
        sendChat(val);
        if (chatInput) chatInput.value = '';
      }
    };
    
    sendBtn?.addEventListener('click', handleSend);
    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    vizBody.querySelectorAll('.speak-msg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        if (speakingMsgIdx === idx) {
          speech.stop();
          speakingMsgIdx = -1;
          renderVizBody();
          return;
        }
        speech.stop();
        speakingMsgIdx = idx;
        renderVizBody();
        const msg = chatMessages[idx];
        if (msg) {
          speech.speak(msg.content).then(() => {
            speakingMsgIdx = -1;
            renderVizBody();
          }).catch(() => {
            speakingMsgIdx = -1;
            renderVizBody();
          });
        }
      });
    });

    const infoMap = {
      array: {
        name: 'Arrays',
        analogy: '🗄️ A straight row of numbered lockers side-by-side.',
        concept: 'A collection of items stored in adjacent memory slots. You can access any locker instantly if you know its number (index).',
        vizGuide: [
          'Comparing (Yellow): We check the values of two lockers.',
          'Swapping (Orange): We trade the items between lockers.',
          'Pointers (Arrows): Watch indexes (i, j, mid) shift dynamically.'
        ],
        tips: ['O(1) random access by index', 'O(n) insertion/deletion mid-array', 'O(n log n) optimal sorting time']
      },
      linkedlist: {
        name: 'Linked Lists',
        analogy: '🗺️ A treasure hunt where each clue points to the next location.',
        concept: 'Elements (nodes) stored randomly in memory. Each node holds its data and the memory address of the next node.',
        vizGuide: [
          'Nodes: Labeled boxes showing current values.',
          'Arrows: Pointers connecting one node to the next.',
          'Rewiring: Inserting/deleting updates the arrows without moving the boxes.'
        ],
        tips: ['O(1) insert/delete (with pointer)', 'O(n) traversal search time', 'No contiguous memory requirement']
      },
      tree: {
        name: 'Binary Trees',
        analogy: '🌳 A family tree starting at the grandfather node at the top.',
        concept: 'A hierarchical structure where each node points to at most two child nodes (left and right).',
        vizGuide: [
          'Root (Top): The starting point of the tree.',
          'BST Search: Goes left if target is smaller, right if larger.',
          'Traversal: Watch the pointer walk through nodes in order.'
        ],
        tips: ['BST Inorder traversal = sorted list', 'O(log n) height search in balanced trees', 'BFS uses Queue, DFS uses recursion/Stack']
      },
      graph: {
        name: 'Graphs',
        analogy: '✈️ A flight map of cities connected by flight paths.',
        concept: 'A network of nodes connected by lines (edges). Unlike trees, graphs can have loops and multiple paths between nodes.',
        vizGuide: [
          'Nodes & Edges: Labeled circles and connecting paths.',
          'BFS: Explores outward in circular layers (ripples).',
          'DFS: Crawls deep into one path before backtracking.'
        ],
        tips: ['BFS finding shortest unweighted path', 'Dijkstra finding weighted shortest path', 'DFS detecting cycles and connectivity']
      },
      'stack-queue': {
        name: 'Stack & Queue',
        analogy: '🥞 Stack: A stack of plates. 🎟️ Queue: A line at a ticket counter.',
        concept: 'Stack is LIFO (Last In First Out) — top access only. Queue is FIFO (First In First Out) — enter rear, exit front.',
        vizGuide: [
          'Stack (LIFO): Items push onto and pop off the top.',
          'Queue (FIFO): Items enqueue at the back and dequeue from the front.',
          'Pointers: Labeled arrows tracking Top, Front, and Rear.'
        ],
        tips: ['Stack: Undo history, parsing brackets', 'Queue: Print buffer, BFS search queue', 'O(1) insertion and deletion times']
      },
      dp: {
        name: 'Dynamic Programming',
        analogy: '📝 Remembering that 2+2=4 so you can solve 2+2+1 instantly without recounting.',
        concept: 'Solving complex problems by breaking them into smaller subproblems, solving them once, and caching their answers in a table.',
        vizGuide: [
          'Table (Grid): Cells represent cached subproblem solutions.',
          'Filling: Watch cells compute left-to-right or top-to-bottom.',
          'Dependencies: Arrows show which past cells were looked up to compute the current one.'
        ],
        tips: ['Memoization (Top-down) vs Tabulation (Bottom-up)', 'Overlapping subproblems + Optimal substructure', 'Caching prevents exponential time complexity']
      }
    };

    const opMap = {
      // Arrays
      'Traversal': {
        name: 'Traversal',
        desc: 'Looping through every element in the array from start to end (index 0 to n-1) to check or perform an action on each item.',
        howItWorks: 'You will see a pointer step from locker to locker sequentially, checking its value.'
      },
      'Bubble Sort': {
        name: 'Bubble Sort',
        desc: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Large values "bubble up" to the end.',
        howItWorks: 'Two neighboring bars turn yellow. If the left is taller than the right, they turn orange and swap places.'
      },
      'Selection Sort': {
        name: 'Selection Sort',
        desc: 'A sorting algorithm that divides the array into sorted and unsorted regions. It repeatedly finds the smallest element in the unsorted region and swaps it with the first unsorted element.',
        howItWorks: 'A pointer scans the array to find the minimum value (turns orange). Then, it swaps this minimum value into its correct sorted position (turns green).'
      },
      'Merge Sort': {
        name: 'Merge Sort',
        desc: 'A divide-and-conquer algorithm. It recursively splits the array in half until individual elements remain, sorts those halves, and merges them back together into a single sorted list.',
        howItWorks: 'The array splits visually into smaller parts, sorts them separately, and then merges them back together in correct order.'
      },
      'Quick Sort': {
        name: 'Quick Sort',
        desc: 'A divide-and-conquer algorithm. It picks an element as a "pivot" and partitions the array around it, putting smaller elements to its left and larger ones to its right, then repeating recursively.',
        howItWorks: 'A pivot bar is selected (turns red). Other elements are compared against it and rearranged around the pivot.'
      },
      'Binary Search': {
        name: 'Binary Search',
        desc: 'An efficient search algorithm for sorted arrays. It checks the middle element; if it is not the target, it discards the half where the target cannot be, halving the search space each step.',
        howItWorks: 'Left and Right pointers track the search range. The Middle element turns yellow. The discarded half fades out.'
      },
      'Two Pointer': {
        name: 'Two Pointer',
        desc: 'A technique using two pointers that scan the array simultaneously (typically starting at both ends and moving towards each other) to search for pairs or verify properties in O(n) time.',
        howItWorks: 'Two pointers (e.g. Left and Right) start at opposite ends and move closer depending on their sum relative to the target.'
      },
      'Sliding Window': {
        name: 'Sliding Window',
        desc: 'A technique that maintains a sub-array (window) over a larger array. The window expands or shrinks (by moving the start/end pointers) to find sub-arrays meeting specific criteria.',
        howItWorks: 'A colored box highlights a sub-segment of bars, expanding to include new elements or shrinking to exclude old ones.'
      },

      // Linked Lists
      'Insert at Head': {
        name: 'Insert at Head',
        desc: 'Creating a new node and inserting it at the very beginning of the list, making it the new head.',
        howItWorks: 'A new node box is created. Its next pointer arrow points to the old head node, and the head pointer updates.'
      },
      'Insert at Tail': {
        name: 'Insert at Tail',
        desc: 'Traversing the list to find the last node (tail) and connecting its next pointer to a newly created node.',
        howItWorks: 'The list is traversed node-by-node. When the end is reached, the null pointer is replaced with an arrow to the new node.'
      },
      'Insert at Position': {
        name: 'Insert at Position',
        desc: 'Inserting a new node at a specific index by traversing to index position k, and updating pointers to slot the new node in.',
        howItWorks: 'Traverses to the node before target position. The new node points to the next node, and the previous node is re-routed to point to the new node.'
      },
      'Delete Node': {
        name: 'Delete Node',
        desc: 'Removing a node from the list by rerouting the previous node\'s pointer arrow directly to the next node, bypassing the deleted node.',
        howItWorks: 'The deleted node turns red and fades, and the incoming arrow is redirected to bypass it.'
      },
      'Reverse': {
        name: 'Reverse',
        desc: 'Flipping the direction of all pointer links in the list. The head node becomes the tail, and the tail becomes the new head.',
        howItWorks: 'Watch arrows flip directions one-by-one, keeping track of pointers using Prev, Curr, and Next labels.'
      },
      'Detect Cycle': {
        name: 'Detect Cycle',
        desc: 'Floyd\'s Cycle Finding algorithm. Uses a slow pointer (1 step per turn) and a fast pointer (2 steps per turn). If a loop/cycle exists, they will eventually meet.',
        howItWorks: 'Two pointer labels (Slow and Fast) run around a looped list until they land on the exact same node.'
      },

      // Trees
      'Inorder Traversal': {
        name: 'Inorder Traversal',
        desc: 'A binary tree traversal method that visits nodes in the order: Left Child → Parent → Right Child. For Binary Search Trees, this prints values in sorted ascending order.',
        howItWorks: 'The traversal pointer steps down left branches, visits the node, then goes down right branches recursively.'
      },
      'Preorder Traversal': {
        name: 'Preorder Traversal',
        desc: 'A binary tree traversal method that visits nodes in the order: Parent (Root) → Left Child → Right Child. Commonly used to duplicate or clone trees.',
        howItWorks: 'Nodes are highlighted green immediately when visited first, before the pointer descends down their left and right subtrees.'
      },
      'Postorder Traversal': {
        name: 'Postorder Traversal',
        desc: 'A binary tree traversal method that visits nodes in the order: Left Child → Right Child → Parent. Commonly used for deleting or emptying trees.',
        howItWorks: 'Nodes are visited and highlighted green only *after* all of their children have been completely traversed.'
      },
      'Level Order (BFS)': {
        name: 'Level Order (BFS)',
        desc: 'A traversal method that visits all nodes level-by-level from top to bottom, and left to right within each level.',
        howItWorks: 'Nodes are processed row-by-row. A queue visualization at the bottom shows nodes waiting to be visited.'
      },
      'BST Insert': {
        name: 'BST Insert',
        desc: 'Inserting a value into a Binary Search Tree. It compares values starting at the root and descends left (if smaller) or right (if larger) until it finds a vacant leaf position.',
        howItWorks: 'Watch the path nodes turn orange as the insert value descends. The value is appended as a new leaf (turns cyan).'
      },
      'BST Search': {
        name: 'BST Search',
        desc: 'Searching for a value in a Binary Search Tree. Starting from the root, it goes left if the target is smaller or right if the target is larger, finding it in O(log n) time.',
        howItWorks: 'Watch the search path turn orange. If the value is found, the node turns bright green.'
      },

      // Graphs
      'BFS Traversal': {
        name: 'BFS Traversal',
        desc: 'Breadth-First Search. Explores all neighbor nodes at the current distance layer before moving to nodes at the next layer (uses a Queue).',
        howItWorks: 'Nodes turn yellow when put into the queue and green when fully visited. The queue is shown at the bottom.'
      },
      'DFS Traversal': {
        name: 'DFS Traversal',
        desc: 'Depth-First Search. Explores as far as possible along each branch before backtracking (uses a Stack or Recursion).',
        howItWorks: 'The traversal pointer crawls along connections, turning nodes green, and backtracks only when it hits a visited deadlock.'
      },
      'Dijkstra Shortest Path': {
        name: 'Dijkstra\'s Shortest Path',
        desc: 'Finds the shortest paths from a single source node to all other nodes in a weighted graph by greedily visiting the closest unvisited node.',
        howItWorks: 'Every node displays its current calculated distance from source. Shortest distances are updated and finalized step-by-step.'
      },
      'Topological Sort': {
        name: 'Topological Sort',
        desc: 'A linear ordering of vertices in a directed graph such that for every directed edge U → V, vertex U comes before V. Used for resolving task dependencies.',
        howItWorks: 'Finds nodes with no incoming dependencies (in-degree = 0) and processes them, reducing the dependency count of neighboring nodes.'
      },

      // Stacks & Queues
      'Stack - Push': {
        name: 'Stack Push',
        desc: 'Adds a new element onto the top of the stack. (LIFO - Last In First Out).',
        howItWorks: 'Watch a new element slide into the top of the stack column, making it the new top element.'
      },
      'Stack - Pop': {
        name: 'Stack Pop',
        desc: 'Removes and returns the top element of the stack. (LIFO - Last In First Out).',
        howItWorks: 'Watch the top element highlight and slide out of the stack, shifting the top pointer downwards.'
      },
      'Stack - Peek': {
        name: 'Stack Peek',
        desc: 'Returns the value of the top element of the stack without removing it.',
        howItWorks: 'The top element highlights in green, indicating we are checking its value without popping it.'
      },
      'Queue - Enqueue': {
        name: 'Queue Enqueue',
        desc: 'Adds a new element to the back (rear) of the queue. (FIFO - First In First Out).',
        howItWorks: 'Watch a new element slide in and join at the rear of the queue line on the right.'
      },
      'Queue - Dequeue': {
        name: 'Queue Dequeue',
        desc: 'Removes the front element from the queue. (FIFO - First In First Out).',
        howItWorks: 'Watch the front element on the left highlight and slide out of the queue line, shifting the front pointer.'
      },
      'Queue - Peek': {
        name: 'Queue Peek',
        desc: 'Returns the value of the front element of the queue without removing it.',
        howItWorks: 'The front element highlights in green, showing we are checking its value without dequeuing.'
      },

      // Dynamic Programming
      'Fibonacci (1D DP)': {
        name: 'Fibonacci 1D DP',
        desc: 'Calculates Fibonacci numbers using a 1D array where each index stores the sum of the two previous array cells: dp[i] = dp[i-1] + dp[i-2].',
        howItWorks: 'The array cells are filled left-to-right. Yellow arrows show the current cell pulling values from the two cells to its left.'
      },
      'Coin Change (1D DP)': {
        name: 'Coin Change 1D DP',
        desc: 'Finds the minimum coins needed to make a target amount. The array dp[i] stores the min coins needed for sum i, calculated by trying each coin.',
        howItWorks: 'We compute values for amounts 1 to target. For each cell, we look back coin-steps in the array to find the optimal previous solution.'
      },
      'Longest Common Subsequence (2D DP)': {
        name: 'LCS 2D DP',
        desc: 'Finds the length of the longest subsequence present in both strings by filling a 2D grid where rows represent characters of String 1 and columns represent String 2.',
        howItWorks: 'If characters match, the cell adds 1 diagonally. If they don\'t, it takes the maximum of the top or left cells.'
      },
      '0/1 Knapsack (2D DP)': {
        name: '0/1 Knapsack 2D DP',
        desc: 'Determines the max value we can fit in a knapsack of limited weight capacity. The 2D grid rows represent items and columns represent capacities.',
        howItWorks: 'For each cell, we decide whether to exclude the item (copy cell from row above) or include it (add value + look up remaining capacity above).'
      },
      'Edit Distance (2D DP)': {
        name: 'Edit Distance 2D DP',
        desc: 'Calculates the min operations (insert, delete, replace) to turn String 1 into String 2 using a 2D grid where each cell stores the cost of transformation.',
        howItWorks: 'If characters match, we copy the diagonal value. If they mismatch, we take the minimum of left, top, and diagonal cells + 1.'
      }
    };

    const info = infoMap[activeViz];
    const opInfo = opMap[activeOperation];
    if (info) {
      vizBody.querySelector('#edu-info').innerHTML = `
        <div class="card" style="margin-top: 12px; display: flex; flex-direction: column; gap: 12px; text-align: left;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
            <span style="font-size:11px; font-weight:700; color:var(--text-muted); display:flex; align-items:center; gap:5px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              ${info.name.toUpperCase()} CONCEPT GUIDE
            </span>
            <span class="badge badge-easy" style="font-size: 9px; padding: 1px 6px;">Beginner Friendly</span>
          </div>

          <div>
            <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Real-life Analogy</div>
            <div style="font-size: 13px; font-style: italic; color: var(--text-secondary); background: var(--bg-secondary); padding: 8px 12px; border-radius: var(--radius-md); border-left: 3px solid var(--accent); line-height: 1.5;">
              ${info.analogy}
            </div>
          </div>

          <div>
            <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">What is going on?</div>
            <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.6; margin: 0;">
              ${info.concept}
            </p>
          </div>

          ${opInfo ? `
          <div>
            <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Active Operation: ${opInfo.name}</div>
            <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.6; margin: 0; background: var(--accent-muted); padding: 8px 12px; border-radius: var(--radius-md); border-left: 3px solid var(--accent);">
              <p style="margin: 0; font-weight: 500; color: var(--text-primary);">${opInfo.desc}</p>
              <p style="margin: 6px 0 0 0; font-size: 11.5px; color: var(--text-muted); display:flex; gap:4px; align-items:flex-start;">
                <span>💡</span>
                <span><strong>In the simulation:</strong> ${opInfo.howItWorks}</span>
              </p>
            </div>
          </div>
          ` : ''}

          <div>
            <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">How to read the simulation</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${info.vizGuide.map(g => {
                const parts = g.split(':');
                return `<div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; display: flex; gap: 4px; align-items: flex-start;">
                  <span style="color: var(--accent); font-weight: bold;">·</span>
                  <span><strong>${parts[0]}</strong>:${parts[1]}</span>
                </div>`;
              }).join('')}
            </div>
          </div>

          <div>
            <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Quick Cheat-Sheet Tips</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${info.tips.map(t => `<span class="chip" style="font-size: 10.5px; padding: 4px 10px; cursor: default; background: var(--bg-secondary); border-color: var(--border);">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }

    scrollChat();
  }

  function startPlay() {
    clearTimer();
    playNextStep();
  }

  function playNextStep() {
    if (!playing) return;
    if (stepIndex >= steps.length - 1) {
      clearTimer();
      playing = false;
      const b = container.querySelector('#btn-play');
      if (b) b.textContent = 'Play';
      return;
    }
    stepIndex++;
    update();

    const step = steps[stepIndex];
    if (vizAudioGuide && step && step.message) {
      const friendlyText = getFriendlyExplanation(step);
      speech.speak(friendlyText)
        .then(() => {
          playTimer = setTimeout(() => {
            playNextStep();
          }, 800);
        })
        .catch(() => {
          playTimer = setTimeout(() => {
            playNextStep();
          }, speed);
        });
    } else {
      playTimer = setTimeout(() => {
        playNextStep();
      }, speed);
    }
  }

  function clearTimer() {
    if (playTimer) {
      clearTimeout(playTimer);
      playTimer = null;
    }
  }

  function update() {
    drawCurrentStep();
    const msg = container.querySelector('#step-msg'), pf = container.querySelector('.progress-fill');
    if (msg) msg.textContent = steps[stepIndex]?.message || '';
    if (pf) pf.style.width = `${((stepIndex+1)/steps.length)*100}%`;

    // Sound effect & Spoken voice guide
    const step = steps[stepIndex];
    if (step) {
      playSoundForStep(step, stepIndex, steps.length);
      // Only speak on manual step if NOT playing (to avoid double speaking when playing)
      if (!playing && vizAudioGuide && step.message) {
        speech.speak(getFriendlyExplanation(step)).catch(() => {});
      }
    }
  }

  function drawCurrentStep() {
    if (!canvas || !ctx || !currentModule || !steps.length) return;
    const W = canvas.getBoundingClientRect().width || (canvas.width / (window.devicePixelRatio || 1));
    const H = canvas.getBoundingClientRect().height || (canvas.height / (window.devicePixelRatio || 1));
    if (W > 0) {
      ctx.clearRect(0, 0, W, H);
      try { currentModule.render(ctx, steps[stepIndex], W, H); } catch(e) { /* silent */ }
    }
  }

  renderPage();
  return () => { speech.stop(); clearTimer(); if (resizeObserver) resizeObserver.disconnect(); };
}
