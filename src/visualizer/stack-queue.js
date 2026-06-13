// ── Stack & Queue Visualizer ──────────────────────────────────────────────────

export const stackQueueVisualizer = {
  name: 'Stack & Queue',
  operations: ['Stack - Push', 'Stack - Pop', 'Stack - Peek', 'Queue - Enqueue', 'Queue - Dequeue', 'Queue - Peek'],

  generateSteps(operation, inputData) {
    const steps = [];

    if (operation.startsWith('Stack')) {
      let stack = [3, 7, 12, 5]; // initial stack (bottom to top: index 0 = bottom)

      if (operation === 'Stack - Push') {
        const pushVals = [9, 4, 6];
        steps.push({ type: 'stack', data: [...stack], highlight: null, message: 'Initial stack state', action: null });
        for (const val of pushVals) {
          stack = [...stack, val];
          steps.push({ type: 'stack', data: [...stack], highlight: stack.length - 1, message: `PUSH ${val} → pushed onto stack`, action: 'push', actionVal: val });
        }
        steps.push({ type: 'stack', data: [...stack], highlight: null, message: 'Push operations complete', action: null });
      }

      if (operation === 'Stack - Pop') {
        steps.push({ type: 'stack', data: [...stack], highlight: stack.length - 1, message: `TOP = ${stack[stack.length - 1]}`, action: null });
        for (let i = 0; i < Math.min(3, stack.length); i++) {
          const popped = stack[stack.length - 1];
          steps.push({ type: 'stack', data: [...stack], highlight: stack.length - 1, message: `POP → removing ${popped}`, action: 'pop', actionVal: popped });
          stack = stack.slice(0, -1);
          steps.push({ type: 'stack', data: [...stack], highlight: null, message: `Popped ${popped}. Stack size: ${stack.length}`, action: null });
        }
        steps.push({ type: 'stack', data: [...stack], highlight: null, message: 'Pop operations complete', action: null });
      }

      if (operation === 'Stack - Peek') {
        steps.push({ type: 'stack', data: [...stack], highlight: null, message: 'Peek: look at top without removing', action: null });
        steps.push({ type: 'stack', data: [...stack], highlight: stack.length - 1, message: `TOP = ${stack[stack.length - 1]} (not removed)`, action: 'peek' });
        steps.push({ type: 'stack', data: [...stack], highlight: null, message: 'Peek complete — stack unchanged', action: null });
      }
    }

    if (operation.startsWith('Queue')) {
      let queue = [2, 8, 15, 4]; // front = index 0, rear = last

      if (operation === 'Queue - Enqueue') {
        const enqVals = [11, 7, 3];
        steps.push({ type: 'queue', data: [...queue], highlightFront: null, highlightRear: queue.length - 1, message: 'Initial queue state', action: null });
        for (const val of enqVals) {
          queue = [...queue, val];
          steps.push({ type: 'queue', data: [...queue], highlightFront: null, highlightRear: queue.length - 1, message: `ENQUEUE ${val} → added to rear`, action: 'enqueue', actionVal: val });
        }
        steps.push({ type: 'queue', data: [...queue], highlightFront: null, highlightRear: null, message: 'Enqueue operations complete', action: null });
      }

      if (operation === 'Queue - Dequeue') {
        steps.push({ type: 'queue', data: [...queue], highlightFront: 0, highlightRear: null, message: `FRONT = ${queue[0]}`, action: null });
        for (let i = 0; i < Math.min(3, queue.length); i++) {
          const dequeued = queue[0];
          steps.push({ type: 'queue', data: [...queue], highlightFront: 0, highlightRear: null, message: `DEQUEUE → removing ${dequeued} from front`, action: 'dequeue', actionVal: dequeued });
          queue = queue.slice(1);
          steps.push({ type: 'queue', data: [...queue], highlightFront: queue.length > 0 ? 0 : null, highlightRear: null, message: `Dequeued ${dequeued}. Queue size: ${queue.length}`, action: null });
        }
        steps.push({ type: 'queue', data: [...queue], highlightFront: null, highlightRear: null, message: 'Dequeue operations complete', action: null });
      }

      if (operation === 'Queue - Peek') {
        steps.push({ type: 'queue', data: [...queue], highlightFront: null, highlightRear: null, message: 'Peek: look at front without removing', action: null });
        steps.push({ type: 'queue', data: [...queue], highlightFront: 0, highlightRear: null, message: `FRONT = ${queue[0]} (not removed)`, action: 'peek' });
        steps.push({ type: 'queue', data: [...queue], highlightFront: null, highlightRear: null, message: 'Peek complete — queue unchanged', action: null });
      }
    }

    if (steps.length === 0) steps.push({ type: 'stack', data: [], message: 'Select an operation', action: null });
    return steps;
  },

  render(ctx, step, W, H) {
    if (!step) return;
    ctx.clearRect(0, 0, W, H);

    if (step.type === 'stack') {
      this._renderStack(ctx, step, W, H);
    } else {
      this._renderQueue(ctx, step, W, H);
    }
  },

  _renderStack(ctx, step, W, H) {
    const data = step.data || [];
    const cellH = Math.min(44, (H - 100) / Math.max(data.length, 1));
    const cellW = Math.min(180, W * 0.5);
    const x = (W - cellW) / 2;
    const startY = H - 60 - cellH;

    // Draw cells from bottom to top
    data.forEach((val, i) => {
      const y = startY - i * cellH;
      const isTop = i === data.length - 1;
      const isHighlighted = step.highlight === i;

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      // Cell background
      const bg = isHighlighted ? (step.action === 'pop' ? '#ef4444' : step.action === 'peek' ? '#fbbf24' : '#22c55e') : '#667eea';
      ctx.fillStyle = isHighlighted ? bg : (isDark ? 'rgba(102,126,234,0.25)' : 'rgba(99,102,241,0.15)');
      ctx.strokeStyle = isDark ? '#818cf8' : '#667eea';
      ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH - 2, 6);
      ctx.fill();
      ctx.stroke();

      // Value
      ctx.fillStyle = isHighlighted ? '#fff' : (isDark ? 'rgba(255,255,255,0.85)' : '#0f172a');
      ctx.font = `bold 15px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(val), x + cellW / 2, y + cellH / 2 - 1);

      // TOP label
      if (isTop) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('◄ TOP', x + cellW + 8, y + cellH / 2);
      }
    });

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    // Base
    ctx.fillStyle = isDark ? '#334155' : '#64748b';
    ctx.fillRect(x - 8, startY + cellH, cellW + 16, 6);

    // Labels
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Size: ${data.length}`, W / 2, H - 30);
    
    if (step.message) {
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.85)';
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText(step.message, W / 2, H - 12);
    }
  },

  _renderQueue(ctx, step, W, H) {
    const data = step.data || [];
    const cellW = Math.min(60, (W - 60) / Math.max(data.length, 1));
    const cellH = 48;
    const totalW = data.length * cellW + (data.length - 1) * 4;
    let startX = (W - totalW) / 2;
    const y = H / 2 - cellH / 2 - 20;

    // FRONT / REAR labels
    if (data.length > 0) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FRONT', startX + cellW / 2, y - 20);
      ctx.fillStyle = '#ef4444';
      ctx.fillText('REAR', startX + (data.length - 1) * (cellW + 4) + cellW / 2, y - 20);
    }

    data.forEach((val, i) => {
      const cx = startX + i * (cellW + 4);
      const isFront = step.highlightFront === i;
      const isRear = step.highlightRear === i;
      const isHighlighted = isFront || isRear;

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.fillStyle = isFront ? 'rgba(34,197,94,0.3)' : isRear ? 'rgba(239,68,68,0.3)' : (isDark ? 'rgba(102,126,234,0.25)' : 'rgba(99,102,241,0.15)');
      ctx.strokeStyle = isFront ? '#22c55e' : isRear ? '#ef4444' : (isDark ? '#667eea' : '#4f46e5');
      ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.roundRect(cx, y, cellW, cellH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHighlighted ? '#fff' : (isDark ? 'rgba(255,255,255,0.85)' : '#0f172a');
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(val), cx + cellW / 2, y + cellH / 2);

      // Arrows between cells
      if (i < data.length - 1) {
        ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText('→', cx + cellW + 2, y + cellH / 2);
      }
    });

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    if (data.length === 0) {
      ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('[ EMPTY QUEUE ]', W / 2, H / 2);
    }

    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Size: ${data.length}`, W / 2, H - 45);
    
    if (step.message) {
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.85)';
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText(step.message, W / 2, H - 20);
    }
  }
};
