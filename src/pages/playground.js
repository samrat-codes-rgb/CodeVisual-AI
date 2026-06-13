import { store } from '../store.js';
import { showToast } from '../components/toast.js';

const TEMPLATES = {
  python: '# Solution\n\ndef solution():\n    pass\n\nprint(solution())',
  javascript: '// Solution\n\nfunction solution() {\n    \n}\n\nconsole.log(solution());',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello");\n    }\n}',
  cpp: '#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    cout << "Hello" << endl;\n    return 0;\n}',
};

export function render(container) {
  let lang = store.get('settings.language') || 'python';
  let code = store.get('playground.code') || TEMPLATES[lang] || '';
  let output = '';
  let isRunning = false;

  function renderPage() {
    container.innerHTML = `
      <div class="playground-page">
        <div class="page-header">
          <h1>Playground</h1>
          <select class="input select" id="lang-select" style="width:auto;padding:5px 10px;font-size:11px;">
            <option value="python" ${lang==='python'?'selected':''}>Python</option>
            <option value="javascript" ${lang==='javascript'?'selected':''}>JavaScript</option>
            <option value="java" ${lang==='java'?'selected':''}>Java</option>
            <option value="cpp" ${lang==='cpp'?'selected':''}>C++</option>
          </select>
        </div>

        <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">
          JavaScript runs natively. Python uses Pyodide. Java/C++ need an external compiler.
        </div>

        <div class="playground-grid-container">
          <div class="playground-left">
            <div class="card" style="margin-bottom:8px;padding:0;overflow:hidden;">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border);">
                <span style="font-size:10px;font-weight:600;color:var(--text-muted);">EDITOR</span>
                <div style="display:flex;gap:4px;">
                  <button class="btn btn-ghost" id="btn-reset-code" style="padding:2px 8px;font-size:10px;">Reset</button>
                  <button class="btn btn-ghost" id="btn-copy-code" style="padding:2px 8px;font-size:10px;">Copy</button>
                </div>
              </div>
              <textarea id="code-editor" spellcheck="false" style="width:100%;min-height:300px;max-height:60vh;background:#111113;color:#e2e8f0;font-family:JetBrains Mono,Fira Code,Consolas,monospace;font-size:12px;line-height:1.6;padding:12px;resize:vertical;border:none;outline:none;box-sizing:border-box;tab-size:4;">${escHtml(code)}</textarea>
            </div>
          </div>
          <div class="playground-right">
            <button class="btn btn-primary" id="btn-run" style="width:100%;padding:10px;margin-bottom:8px;font-size:var(--text-sm);">
              ${isRunning ? 'Running...' : 'Run'}
            </button>

            <div class="card" style="margin-bottom:12px;padding:0;overflow:hidden;">
              <div style="padding:8px 12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:10px;font-weight:600;color:var(--text-muted);">OUTPUT</span>
                <button class="btn btn-ghost" id="btn-clear-output" style="padding:2px 8px;font-size:10px;">Clear</button>
              </div>
              <div id="output-area" style="min-height:100px;max-height:260px;overflow-y:auto;background:#111113;padding:12px;font-family:JetBrains Mono,Consolas,monospace;font-size:12px;color:${output.startsWith('Error') ? 'var(--error)' : '#4ade80'};line-height:1.5;white-space:pre-wrap;">
                ${output ? escHtml(output) : '<span style="color:var(--text-muted);">// Output appears here</span>'}
              </div>
            </div>

            <div class="section-title">Snippets</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:16px;">
              ${getSnippets(lang).map(s => `<button class="chip snippet-btn" data-code="${escAttr(s.code)}">${s.label}</button>`).join('')}
            </div>
          </div>
        </div>
      </div>`;

    attachEvents(container);
  }

  function getSnippets(lang) {
    if (lang === 'python') return [
      { label: 'Sort', code: 'nums = [5,2,8,1,9]\nnums.sort()\nprint(nums)' },
      { label: 'Hash Map', code: 'freq = {}\nfor x in [1,2,2,3]:\n    freq[x] = freq.get(x,0)+1\nprint(freq)' },
      { label: 'Binary Search', code: 'def bs(arr,t):\n    l,r=0,len(arr)-1\n    while l<=r:\n        m=(l+r)//2\n        if arr[m]==t: return m\n        elif arr[m]<t: l=m+1\n        else: r=m-1\n    return -1\nprint(bs([1,3,5,7,9],5))' },
      { label: 'Two Sum', code: 'def twoSum(nums,t):\n    seen={}\n    for i,n in enumerate(nums):\n        if t-n in seen: return [seen[t-n],i]\n        seen[n]=i\nprint(twoSum([2,7,11,15],9))' },
    ];
    if (lang === 'javascript') return [
      { label: 'Sort', code: 'const nums = [5,2,8,1,9];\nnums.sort((a,b)=>a-b);\nconsole.log(nums);' },
      { label: 'Hash Map', code: 'const freq = {};\nfor (const x of [1,2,2,3]) freq[x]=(freq[x]||0)+1;\nconsole.log(freq);' },
      { label: 'Binary Search', code: 'function bs(arr,t){let l=0,r=arr.length-1;while(l<=r){const m=Math.floor((l+r)/2);if(arr[m]===t)return m;else if(arr[m]<t)l=m+1;else r=m-1;}return -1;}\nconsole.log(bs([1,3,5,7,9],5));' },
    ];
    return [{ label: 'Template', code: TEMPLATES[lang] }];
  }

  function attachEvents(container) {
    const editor = container.querySelector('#code-editor');
    const langSelect = container.querySelector('#lang-select');
    const runBtn = container.querySelector('#btn-run');
    if (editor) {
      editor.addEventListener('input', () => { code = editor.value; store.set('playground.code', code); });
      editor.addEventListener('keydown', (e) => { if (e.key === 'Tab') { e.preventDefault(); const s = editor.selectionStart; editor.value = editor.value.substring(0,s)+'    '+editor.value.substring(editor.selectionEnd); editor.selectionStart = editor.selectionEnd = s+4; code = editor.value; } });
    }
    if (langSelect) langSelect.addEventListener('change', () => { lang = langSelect.value; store.set('settings.language', lang); code = TEMPLATES[lang]||''; store.set('playground.code', code); renderPage(); });
    if (runBtn) runBtn.addEventListener('click', async () => { isRunning = true; output = ''; renderPage(); try { output = await exec(lang, code); } catch(e) { output = `Error: ${e.message}`; } isRunning = false; renderPage(); });
    container.querySelector('#btn-reset-code')?.addEventListener('click', () => { code = TEMPLATES[lang]||''; store.set('playground.code', code); renderPage(); });
    container.querySelector('#btn-copy-code')?.addEventListener('click', () => { navigator.clipboard.writeText(code).then(() => showToast('Copied', 'success')); });
    container.querySelector('#btn-clear-output')?.addEventListener('click', () => { output = ''; const a = container.querySelector('#output-area'); if (a) a.innerHTML = '<span style="color:var(--text-muted);">// Output appears here</span>'; });
    container.querySelectorAll('.snippet-btn').forEach(b => b.addEventListener('click', () => { code = b.dataset.code; store.set('playground.code', code); renderPage(); }));
  }

  async function exec(lang, code) {
    if (lang === 'javascript') { const logs = []; const ol = console.log; console.log = (...a) => logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')); try { new Function(code)(); console.log = ol; return logs.length ? logs.join('\n') : 'Ran successfully (no output)'; } catch(e) { console.log = ol; return `Error: ${e.message}`; } }
    if (lang === 'python') { try { if (window.pyodide) { const r = await window.pyodide.runPythonAsync(code); return r !== undefined ? String(r) : 'Ran successfully'; } output = 'Loading Python runtime...'; const a = document.querySelector('#output-area'); if (a) a.textContent = output; if (!window._loadingPyodide) { window._loadingPyodide = true; const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); window.pyodide = await window.loadPyodide(); delete window._loadingPyodide; } const r = await window.pyodide.runPythonAsync(code); return r !== undefined ? String(r) : 'Ran successfully'; } catch(e) { return `Error: ${e.message}`; } }
    return `${lang === 'java' ? 'Java' : 'C++'} requires an external compiler.\n\nTry: onecompiler.com/${lang} or ideone.com`;
  }

  function escHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function escAttr(s) { return (s||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  renderPage();
}
