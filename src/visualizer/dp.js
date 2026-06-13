// ── Dynamic Programming Visualizer ───────────────────────────────────────────

export const dpVisualizer = {
  name: 'Dynamic Programming',
  operations: ['Fibonacci (1D DP)', 'Coin Change (1D DP)', 'Longest Common Subsequence (2D DP)', '0/1 Knapsack (2D DP)', 'Edit Distance (2D DP)'],

  generateSteps(operation, inputData) {
    const steps = [];

    if (operation === 'Fibonacci (1D DP)') {
      const n = 8;
      const dp = new Array(n + 1).fill(0);
      dp[0] = 0; dp[1] = 1;
      steps.push({ type: '1d', dp: [...dp], current: -1, message: 'Initialize dp[0]=0, dp[1]=1', n });
      for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
        steps.push({ type: '1d', dp: [...dp], current: i, prev: [i - 1, i - 2], message: `dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}`, n });
      }
      steps.push({ type: '1d', dp: [...dp], current: -1, message: `Fibonacci(${n}) = ${dp[n]}`, n });
    }

    if (operation === 'Coin Change (1D DP)') {
      const coins = [1, 3, 4];
      const amount = 7;
      const dp = new Array(amount + 1).fill(Infinity);
      dp[0] = 0;
      steps.push({ type: '1d', dp: dp.map(v => v === Infinity ? '∞' : v), current: -1, message: `Coins: [${coins}], Amount: ${amount}. dp[0]=0`, n: amount });
      for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
          if (coin <= i && dp[i - coin] + 1 < dp[i]) {
            dp[i] = dp[i - coin] + 1;
            steps.push({ type: '1d', dp: dp.map(v => v === Infinity ? '∞' : v), current: i, prev: [i - coin], message: `dp[${i}] = dp[${i-coin}]+1 = ${dp[i]} (coin=${coin})`, n: amount });
          }
        }
      }
      steps.push({ type: '1d', dp: dp.map(v => v === Infinity ? '∞' : v), current: -1, message: `Min coins for amount ${amount}: ${dp[amount]}`, n: amount });
    }

    if (operation === 'Longest Common Subsequence (2D DP)') {
      const s1 = 'ABCBDAB', s2 = 'BDCAB';
      const m = s1.length, n = s2.length;
      const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
      steps.push({ type: '2d', dp: dp.map(r => [...r]), s1, s2, i: -1, j: -1, message: `LCS of "${s1}" and "${s2}"` });
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (s1[i - 1] === s2[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
            steps.push({ type: '2d', dp: dp.map(r => [...r]), s1, s2, i, j, message: `s1[${i-1}]='${s1[i-1]}' == s2[${j-1}]='${s2[j-1]}' → dp[${i}][${j}]=dp[${i-1}][${j-1}]+1=${dp[i][j]}` });
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            steps.push({ type: '2d', dp: dp.map(r => [...r]), s1, s2, i, j, message: `s1[${i-1}]='${s1[i-1]}' != s2[${j-1}]='${s2[j-1]}' → dp[${i}][${j}]=max(${dp[i-1][j]},${dp[i][j-1]})=${dp[i][j]}` });
          }
        }
      }
      steps.push({ type: '2d', dp: dp.map(r => [...r]), s1, s2, i: -1, j: -1, message: `LCS length = ${dp[m][n]}` });
    }

    if (operation === '0/1 Knapsack (2D DP)') {
      const weights = [1, 2, 3, 5];
      const values = [1, 6, 10, 16];
      const W = 7;
      const n = weights.length;
      const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
      steps.push({ type: '2d', dp: dp.map(r => [...r]), rowLabels: ['0', ...weights.map((w, i) => `w${i+1}=${w}`)], colLabels: Array.from({ length: W + 1 }, (_, i) => String(i)), i: -1, j: -1, message: `Knapsack: weights=[${weights}], values=[${values}], capacity=${W}` });
      for (let i = 1; i <= n; i++) {
        for (let j = 0; j <= W; j++) {
          if (weights[i - 1] <= j) {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - weights[i - 1]] + values[i - 1]);
          } else {
            dp[i][j] = dp[i - 1][j];
          }
          steps.push({ type: '2d', dp: dp.map(r => [...r]), rowLabels: ['0', ...weights.map((w, k) => `w${k+1}`)], colLabels: Array.from({ length: W + 1 }, (_, c) => String(c)), i, j, message: `Item ${i} (w=${weights[i-1]},v=${values[i-1]}), cap ${j} → ${dp[i][j]}` });
        }
      }
      steps.push({ type: '2d', dp: dp.map(r => [...r]), rowLabels: ['0', ...weights.map((w, k) => `w${k+1}`)], colLabels: Array.from({ length: W + 1 }, (_, c) => String(c)), i: -1, j: -1, message: `Max value = ${dp[n][W]}` });
    }

    if (operation === 'Edit Distance (2D DP)') {
      const s1 = 'HORSE', s2 = 'ROS';
      const m = s1.length, n = s2.length;
      const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
      steps.push({ type: '2d', dp: dp.map(r => [...r]), s1, s2, i: -1, j: -1, message: `Edit distance: "${s1}" → "${s2}"` });
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (s1[i - 1] === s2[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1];
          } else {
            dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
          }
          steps.push({ type: '2d', dp: dp.map(r => [...r]), s1, s2, i, j, message: `dp[${i}][${j}]: "${s1[i-1]}" vs "${s2[j-1]}" → ${dp[i][j]} ops` });
        }
      }
      steps.push({ type: '2d', dp: dp.map(r => [...r]), s1, s2, i: -1, j: -1, message: `Edit distance = ${dp[m][n]}` });
    }

    if (steps.length === 0) steps.push({ type: '1d', dp: [], current: -1, message: 'Select an operation', n: 0 });
    return steps;
  },

  render(ctx, step, W, H) {
    if (!step) return;
    ctx.clearRect(0, 0, W, H);
    if (step.type === '1d') this._render1D(ctx, step, W, H);
    else this._render2D(ctx, step, W, H);
  },

  _render1D(ctx, step, W, H) {
    const dp = step.dp || [];
    const n = dp.length;
    const cellW = Math.min(60, (W - 60) / Math.max(n, 1));
    const cellH = 50;
    const totalW = n * (cellW + 4) - 4;
    let startX = (W - totalW) / 2;
    const y = H / 2 - cellH / 2 - 20;

    dp.forEach((val, i) => {
      const cx = startX + i * (cellW + 4);
      const isCurrent = step.current === i;
      const isPrev = (step.prev || []).includes(i);

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.fillStyle = isCurrent ? '#667eea' : isPrev ? 'rgba(251,191,36,0.3)' : (isDark ? 'rgba(71,85,105,0.4)' : 'rgba(148,163,184,0.25)');
      ctx.strokeStyle = isCurrent ? '#818cf8' : isPrev ? '#fbbf24' : (isDark ? '#475569' : '#cbd5e1');
      ctx.lineWidth = isCurrent || isPrev ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.roundRect(cx, y, cellW, cellH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isCurrent ? '#fff' : (isDark ? 'rgba(255,255,255,0.8)' : '#0f172a');
      ctx.font = `bold 15px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(val), cx + cellW / 2, y + cellH / 2);

      // Index below
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(String(i), cx + cellW / 2, y + cellH + 14);
    });

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    if (step.message) {
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.85)';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(step.message, W / 2, H - 15);
    }
  },

  _render2D(ctx, step, W, H) {
    const dp = step.dp || [];
    if (!dp.length) return;

    const rows = dp.length, cols = dp[0].length;
    const maxCellW = Math.min(40, (W - 80) / cols);
    const maxCellH = Math.min(32, (H - 100) / rows);
    const cellW = maxCellW, cellH = maxCellH;

    const gridW = cols * cellW;
    const gridH = rows * cellH;
    const startX = (W - gridW) / 2 + 20;
    const startY = 30;

    const s1 = step.s1 || '', s2 = step.s2 || '';

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = startX + j * cellW;
        const y = startY + i * cellH;
        const isCurrent = step.i === i && step.j === j;
        const val = dp[i][j];

        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        ctx.fillStyle = isCurrent ? '#667eea' : val > 0 ? (isDark ? 'rgba(102,126,234,0.2)' : 'rgba(102,126,234,0.15)') : (isDark ? 'rgba(71,85,105,0.2)' : 'rgba(226,232,240,0.3)');
        ctx.strokeStyle = isCurrent ? '#818cf8' : (isDark ? '#334155' : '#cbd5e1');
        ctx.lineWidth = isCurrent ? 2 : 1;
        ctx.beginPath();
        ctx.rect(x, y, cellW - 1, cellH - 1);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isCurrent ? '#fff' : (isDark ? 'rgba(255,255,255,0.7)' : '#0f172a');
        ctx.font = `${Math.max(9, cellH * 0.4)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(val), x + cellW / 2, y + cellH / 2);
      }
    }

    // Row/col labels
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    if (s1 || s2) {
      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = `${Math.max(9, cellH * 0.38)}px Inter, sans-serif`;
      ctx.textAlign = 'right';
      for (let i = 0; i < rows; i++) {
        const label = i === 0 ? '' : s1[i - 1] || String(i);
        ctx.fillText(label, startX - 4, startY + i * cellH + cellH / 2);
      }
      ctx.textAlign = 'center';
      for (let j = 0; j < cols; j++) {
        const label = j === 0 ? '' : s2[j - 1] || String(j);
        ctx.fillText(label, startX + j * cellW + cellW / 2, startY - 10);
      }
    }

    if (step.message) {
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.85)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(step.message, W / 2, H - 12);
    }
  }
};
