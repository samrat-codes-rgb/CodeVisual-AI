/**
 * Linked List Visualizer — CodeVisual AI
 *
 * Renders a linked list as a horizontal chain of rounded-rect nodes
 * connected by arrows, with step-by-step traces for 6 operations.
 */

/* ================================================================== */
/*  Helpers                                                           */
/* ================================================================== */
function makeNode(value, id) {
  return { value, id };
}

let _nodeId = 0;
function nextId() {
  return _nodeId++;
}

function defaultList() {
  _nodeId = 0;
  const values = [12, 99, 37, 5, 68, 22];
  return values.map(v => makeNode(v, nextId()));
}

function createStep(nodes, links, head, overrides = {}) {
  return {
    data: {
      nodes: nodes.map(n => ({ ...n })),
      head,
      links: links.map(l => ({ ...l })),
      cycle: null,
    },
    highlights: [],
    comparing: [],
    swapping: [],
    sorted: [],
    active: [],
    pointers: {},
    message: '',
    code: '',
    variables: {},
    newNode: null,
    deletedNode: null,
    ...overrides,
  };
}

function buildLinks(nodes) {
  const links = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    links.push({ from: i, to: i + 1 });
  }
  return links;
}

/* ================================================================== */
/*  1. Insert at Head                                                 */
/* ================================================================== */
function generateInsertHead(inputData) {
  const nodes = defaultList();
  const val = (inputData && inputData.value !== undefined) ? inputData.value : 42;
  const steps = [];
  let links = buildLinks(nodes);

  steps.push(createStep(nodes, links, 0, {
    message: 'Initial linked list',
    code: '# Insert at head',
    pointers: { head: 0 },
  }));

  // Create new node
  const newNode = makeNode(val, nextId());
  nodes.unshift(newNode);
  links = buildLinks(nodes);

  steps.push(createStep(nodes, links, 0, {
    newNode: 0,
    active: [0],
    pointers: { head: 0, oldHead: 1 },
    message: `Created new node with value ${val}`,
    code: `newNode = Node(${val})`,
    variables: { value: val },
  }));

  steps.push(createStep(nodes, links, 0, {
    newNode: 0,
    active: [0],
    highlights: [1],
    pointers: { head: 0 },
    message: `Set newNode.next → old head (${nodes[1].value}). Updated head pointer.`,
    code: `newNode.next = head; head = newNode`,
    variables: { value: val, headValue: nodes[0].value },
  }));

  steps.push(createStep(nodes, links, 0, {
    pointers: { head: 0 },
    message: `Insert at head complete — new head is ${val}`,
    code: '# Done',
  }));

  return steps;
}

/* ================================================================== */
/*  2. Insert at Tail                                                 */
/* ================================================================== */
function generateInsertTail(inputData) {
  const nodes = defaultList();
  const val = (inputData && inputData.value !== undefined) ? inputData.value : 77;
  const steps = [];
  let links = buildLinks(nodes);

  steps.push(createStep(nodes, links, 0, {
    message: 'Traverse to find tail node',
    code: 'curr = head',
    pointers: { head: 0, curr: 0 },
  }));

  for (let i = 0; i < nodes.length; i++) {
    steps.push(createStep(nodes, links, 0, {
      active: [i],
      pointers: { head: 0, curr: i },
      message: `Visiting node ${nodes[i].value}${i === nodes.length - 1 ? ' (tail found — curr.next is null)' : ''}`,
      code: i === nodes.length - 1 ? '# curr.next is None → tail found' : 'curr = curr.next',
      variables: { curr: nodes[i].value },
    }));
  }

  const newNode = makeNode(val, nextId());
  nodes.push(newNode);
  links = buildLinks(nodes);

  steps.push(createStep(nodes, links, 0, {
    newNode: nodes.length - 1,
    active: [nodes.length - 2, nodes.length - 1],
    pointers: { head: 0, tail: nodes.length - 2, new: nodes.length - 1 },
    message: `Created node ${val} and linked tail → new node`,
    code: `curr.next = Node(${val})`,
    variables: { value: val },
  }));

  steps.push(createStep(nodes, links, 0, {
    pointers: { head: 0 },
    message: `Insert at tail complete — appended ${val}`,
    code: '# Done',
  }));

  return steps;
}

/* ================================================================== */
/*  3. Insert at Position                                             */
/* ================================================================== */
function generateInsertAtPosition(inputData) {
  const nodes = defaultList();
  const val = (inputData && inputData.value !== undefined) ? inputData.value : 55;
  const pos = (inputData && inputData.position !== undefined) ? inputData.position : 2;
  const steps = [];
  let links = buildLinks(nodes);

  steps.push(createStep(nodes, links, 0, {
    message: `Insert ${val} at position ${pos}`,
    code: `# Traverse to position ${pos - 1}`,
    pointers: { head: 0 },
    variables: { value: val, position: pos },
  }));

  for (let i = 0; i < pos; i++) {
    steps.push(createStep(nodes, links, 0, {
      active: [i],
      pointers: { head: 0, curr: i },
      message: `At position ${i} — node ${nodes[i].value}`,
      code: 'curr = curr.next',
      variables: { i, curr: nodes[i].value },
    }));
  }

  const newNode = makeNode(val, nextId());
  nodes.splice(pos, 0, newNode);
  links = buildLinks(nodes);

  steps.push(createStep(nodes, links, 0, {
    newNode: pos,
    active: [pos],
    highlights: [pos - 1, pos + 1],
    pointers: { head: 0, prev: pos - 1, new: pos, next: pos + 1 },
    message: `Inserted ${val} between ${nodes[pos - 1].value} and ${nodes[pos + 1].value}`,
    code: `newNode.next = curr.next; curr.next = newNode`,
    variables: { value: val, position: pos },
  }));

  steps.push(createStep(nodes, links, 0, {
    pointers: { head: 0 },
    message: `Insert at position ${pos} complete`,
    code: '# Done',
  }));

  return steps;
}

/* ================================================================== */
/*  4. Delete Node                                                    */
/* ================================================================== */
function generateDeleteNode(inputData) {
  const nodes = defaultList();
  const target = (inputData && inputData.value !== undefined) ? inputData.value : 37;
  const steps = [];
  let links = buildLinks(nodes);

  steps.push(createStep(nodes, links, 0, {
    message: `Delete node with value ${target}`,
    code: 'prev = None; curr = head',
    pointers: { head: 0, curr: 0 },
    variables: { target },
  }));

  let foundIdx = -1;
  for (let i = 0; i < nodes.length; i++) {
    const isTarget = nodes[i].value === target;
    steps.push(createStep(nodes, links, 0, {
      active: [i],
      comparing: isTarget ? [i] : [],
      pointers: { head: 0, prev: i > 0 ? i - 1 : undefined, curr: i },
      message: isTarget
        ? `Found target ${target} at position ${i}!`
        : `Node ${nodes[i].value} ≠ ${target} — continue`,
      code: isTarget ? `# Found ${target}` : 'curr = curr.next',
      variables: { target, curr: nodes[i].value },
    }));

    if (isTarget) {
      foundIdx = i;
      break;
    }
  }

  if (foundIdx >= 0) {
    steps.push(createStep(nodes, links, 0, {
      deletedNode: foundIdx,
      active: [foundIdx],
      pointers: { head: 0, prev: foundIdx > 0 ? foundIdx - 1 : undefined, curr: foundIdx },
      message: `Removing node ${target} — rewiring prev.next → curr.next`,
      code: 'prev.next = curr.next',
      variables: { target, removed: nodes[foundIdx].value },
    }));

    nodes.splice(foundIdx, 1);
    links = buildLinks(nodes);

    steps.push(createStep(nodes, links, 0, {
      pointers: { head: 0 },
      message: `Node ${target} deleted successfully`,
      code: '# Done',
    }));
  } else {
    steps.push(createStep(nodes, links, 0, {
      message: `Value ${target} not found in list`,
      code: 'return  # Not found',
      variables: { target },
    }));
  }

  return steps;
}

/* ================================================================== */
/*  5. Reverse                                                        */
/* ================================================================== */
function generateReverse(inputData) {
  const nodes = defaultList();
  const steps = [];
  let links = buildLinks(nodes);

  steps.push(createStep(nodes, links, 0, {
    message: 'Reverse linked list — three-pointer technique',
    code: 'prev = None; curr = head',
    pointers: { head: 0, curr: 0 },
  }));

  const n = nodes.length;
  let newLinks = [];

  for (let i = 0; i < n; i++) {
    // Show current state
    const prevIdx = i > 0 ? i - 1 : null;
    const nextIdx = i < n - 1 ? i + 1 : null;

    steps.push(createStep(nodes, [...newLinks, ...links.filter(l => l.from >= i)], 0, {
      active: [i],
      highlights: prevIdx !== null ? [prevIdx] : [],
      pointers: {
        prev: prevIdx !== null ? prevIdx : undefined,
        curr: i,
        next: nextIdx !== null ? nextIdx : undefined,
      },
      message: `Reversing: set node ${nodes[i].value}.next → ${prevIdx !== null ? nodes[prevIdx].value : 'null'}`,
      code: `next = curr.next; curr.next = prev; prev = curr; curr = next`,
      variables: {
        prev: prevIdx !== null ? nodes[prevIdx].value : 'None',
        curr: nodes[i].value,
        next: nextIdx !== null ? nodes[nextIdx].value : 'None',
      },
    }));

    // Reverse this link
    if (prevIdx !== null) {
      newLinks.push({ from: i, to: prevIdx });
    }
  }

  // Final reversed list
  const reversedLinks = [];
  for (let i = n - 1; i > 0; i--) {
    reversedLinks.push({ from: i, to: i - 1 });
  }

  steps.push(createStep(nodes, reversedLinks, n - 1, {
    pointers: { head: n - 1 },
    sorted: nodes.map((_, i) => i),
    message: `Reversal complete — new head is ${nodes[n - 1].value}`,
    code: 'head = prev  # Done',
  }));

  return steps;
}

/* ================================================================== */
/*  6. Detect Cycle                                                   */
/* ================================================================== */
function generateDetectCycle(inputData) {
  const values = [10, 20, 30, 40, 50, 60];
  _nodeId = 0;
  const nodes = values.map(v => makeNode(v, nextId()));
  const cycleTarget = 2; // cycle back to index 2 (value 30)
  const steps = [];
  const links = buildLinks(nodes);
  links.push({ from: nodes.length - 1, to: cycleTarget }); // create cycle

  steps.push(createStep(nodes, links, 0, {
    data: {
      nodes: nodes.map(n => ({ ...n })),
      head: 0,
      links: links.map(l => ({ ...l })),
      cycle: { from: nodes.length - 1, to: cycleTarget },
    },
    message: `Detecting cycle using Floyd's algorithm (slow/fast pointers)`,
    code: 'slow = head; fast = head',
    pointers: { slow: 0, fast: 0 },
    variables: { slow: nodes[0].value, fast: nodes[0].value },
  }));

  let slow = 0, fast = 0;
  const nextNode = (idx) => {
    const link = links.find(l => l.from === idx);
    return link ? link.to : -1;
  };

  let met = false;
  for (let iter = 0; iter < 20 && !met; iter++) {
    slow = nextNode(slow);
    fast = nextNode(nextNode(fast));

    if (slow < 0 || fast < 0) break;

    steps.push(createStep(nodes, links, 0, {
      data: {
        nodes: nodes.map(n => ({ ...n })),
        head: 0,
        links: links.map(l => ({ ...l })),
        cycle: { from: nodes.length - 1, to: cycleTarget },
      },
      active: [slow],
      comparing: [fast],
      pointers: { slow, fast },
      message: slow === fast
        ? `Cycle detected! Slow and fast meet at node ${nodes[slow].value}`
        : `Slow → ${nodes[slow].value}, Fast → ${nodes[fast].value}`,
      code: 'slow = slow.next; fast = fast.next.next',
      variables: { slow: nodes[slow].value, fast: nodes[fast].value, iteration: iter + 1 },
    }));

    if (slow === fast) {
      met = true;
    }
  }

  if (met) {
    steps.push(createStep(nodes, links, 0, {
      data: {
        nodes: nodes.map(n => ({ ...n })),
        head: 0,
        links: links.map(l => ({ ...l })),
        cycle: { from: nodes.length - 1, to: cycleTarget },
      },
      sorted: [slow],
      pointers: { meetingPoint: slow },
      message: `Cycle confirmed at node ${nodes[slow].value}!`,
      code: 'return True  # Cycle found',
      variables: { meetAt: nodes[slow].value },
    }));
  }

  return steps;
}

/* ================================================================== */
/*  Render                                                            */
/* ================================================================== */
function renderLinkedList(ctx, step, w, h, meta = {}) {
  ctx.clearRect(0, 0, w, h);
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const { nodes, head, links, cycle } = step.data;
  if (!nodes || nodes.length === 0) return;

  const n = nodes.length;
  const nodeW = Math.min(64, (w - 80) / (n * 1.7));
  const nodeH = nodeW * 0.65;
  const gapX = nodeW * 0.65;
  const totalW = n * nodeW + (n - 1) * gapX;
  const startX = (w - totalW) / 2;
  const centerY = h / 2 - 10;
  const radius = 8;

  // Precompute positions
  const positions = nodes.map((_, i) => ({
    x: startX + i * (nodeW + gapX),
    y: centerY - nodeH / 2,
    cx: startX + i * (nodeW + gapX) + nodeW / 2,
    cy: centerY,
  }));

  // ── Draw arrows (links) ────────────────────────────────────────
  for (const link of links) {
    if (link.from >= n || link.to >= n) continue;
    const fromPos = positions[link.from];
    const toPos = positions[link.to];

    const isCycleEdge = cycle && link.from === cycle.from && link.to === cycle.to;

    if (isCycleEdge) {
      // Draw curved arrow for cycle
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      const cpY = centerY + nodeH * 2;
      ctx.moveTo(fromPos.cx + nodeW / 2, fromPos.cy);
      ctx.quadraticCurveTo(
        (fromPos.cx + toPos.cx) / 2, cpY,
        toPos.cx, toPos.cy + nodeH / 2
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead
      const angle = Math.atan2(toPos.cy + nodeH / 2 - cpY, toPos.cx - (fromPos.cx + toPos.cx) / 2);
      drawArrowHead(ctx, toPos.cx, toPos.cy + nodeH / 2, angle, '#ef4444');
    } else {
      // Straight arrow
      const x1 = fromPos.x + nodeW;
      const y1 = fromPos.cy;
      const x2 = toPos.x;
      const y2 = toPos.cy;

      ctx.strokeStyle = isDark ? '#a0aec0' : '#4a5568';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(y2 - y1, x2 - x1);
      drawArrowHead(ctx, x2, y2, angle, isDark ? '#a0aec0' : '#4a5568');
    }
  }

  // ── Draw null terminator ───────────────────────────────────────
  if (!cycle) {
    const lastPos = positions[n - 1];
    const nullX = lastPos.x + nodeW + gapX * 0.5;
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.45)';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('∅', nullX, centerY);
  }

  // ── Draw nodes ─────────────────────────────────────────────────
  for (let i = 0; i < n; i++) {
    const pos = positions[i];
    let fill = '#667eea';

    if (step.deletedNode === i) fill = 'rgba(239,68,68,0.45)';
    else if (step.newNode === i) fill = '#10b981';
    else if (step.sorted && step.sorted.includes(i)) fill = '#10b981';
    else if (step.active && step.active.includes(i)) fill = '#06b6d4';
    else if (step.comparing && step.comparing.includes(i)) fill = '#fbbf24';
    else if (step.highlights && step.highlights.includes(i)) fill = '#a78bfa';

    // Glow
    if (step.newNode === i || (step.active && step.active.includes(i))) {
      ctx.save();
      ctx.shadowColor = fill;
      ctx.shadowBlur = 14;
    }

    // Rounded rect
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(pos.x + radius, pos.y);
    ctx.lineTo(pos.x + nodeW - radius, pos.y);
    ctx.quadraticCurveTo(pos.x + nodeW, pos.y, pos.x + nodeW, pos.y + radius);
    ctx.lineTo(pos.x + nodeW, pos.y + nodeH - radius);
    ctx.quadraticCurveTo(pos.x + nodeW, pos.y + nodeH, pos.x + nodeW - radius, pos.y + nodeH);
    ctx.lineTo(pos.x + radius, pos.y + nodeH);
    ctx.quadraticCurveTo(pos.x, pos.y + nodeH, pos.x, pos.y + nodeH - radius);
    ctx.lineTo(pos.x, pos.y + radius);
    ctx.quadraticCurveTo(pos.x, pos.y, pos.x + radius, pos.y);
    ctx.closePath();
    ctx.fill();

    if (step.newNode === i || (step.active && step.active.includes(i))) {
      ctx.restore();
    }

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Value text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.min(15, nodeW * 0.3)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(nodes[i].value), pos.cx, pos.cy);
  }

  // ── HEAD label ─────────────────────────────────────────────────
  const headIdx = head !== undefined ? head : 0;
  if (headIdx < positions.length) {
    const headPos = positions[headIdx];
    ctx.fillStyle = isDark ? '#22d3ee' : '#0891b2';
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('HEAD', headPos.cx, headPos.y - 20);

    ctx.fillStyle = isDark ? '#22d3ee' : '#0891b2';
    ctx.beginPath();
    ctx.moveTo(headPos.cx, headPos.y - 4);
    ctx.lineTo(headPos.cx - 5, headPos.y - 14);
    ctx.lineTo(headPos.cx + 5, headPos.y - 14);
    ctx.closePath();
    ctx.fill();
  }

  // ── Pointer labels ─────────────────────────────────────────────
  if (step.pointers) {
    const pColors = {
      curr: '#06b6d4', prev: '#a78bfa', next: '#f97316',
      slow: '#10b981', fast: '#ef4444', head: '#22d3ee',
      tail: '#fbbf24', new: '#10b981', oldHead: '#fbbf24',
      meetingPoint: '#22d3ee',
    };

    const indexToPointers = {};
    for (const [label, idx] of Object.entries(step.pointers)) {
      if (idx === undefined || idx === null || idx >= positions.length || label === 'head') continue;
      if (!indexToPointers[idx]) indexToPointers[idx] = [];
      indexToPointers[idx].push(label);
    }

    for (const [idxStr, labels] of Object.entries(indexToPointers)) {
      const idx = parseInt(idxStr);
      const pos = positions[idx];

      labels.forEach((label, stackIndex) => {
        const offsetY = stackIndex * 22;
        const col = pColors[label] || (isDark ? '#cbd5e1' : '#334155');
        const yBase = pos.y + nodeH + 12 + offsetY;

        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(pos.cx, pos.y + nodeH + 4 + offsetY);
        ctx.lineTo(pos.cx - 4, yBase);
        ctx.lineTo(pos.cx + 4, yBase);
        ctx.closePath();
        ctx.fill();

        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(label, pos.cx, yBase + 2);
      });
    }
  }

  // ── Message ────────────────────────────────────────────────────
  if (step.message) {
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)';
    ctx.font = '13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(step.message, w / 2, h - 10);
  }
}

function drawArrowHead(ctx, x, y, angle, color) {
  const size = 8;
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size / 2);
  ctx.lineTo(-size, size / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ================================================================== */
/*  Export                                                            */
/* ================================================================== */
export const linkedListVisualizer = {
  name: 'Linked List',
  operations: [
    'Insert at Head',
    'Insert at Tail',
    'Insert at Position',
    'Delete Node',
    'Reverse',
    'Detect Cycle',
  ],

  generateSteps(operation, inputData) {
    const generators = {
      'Insert at Head': generateInsertHead,
      'Insert at Tail': generateInsertTail,
      'Insert at Position': generateInsertAtPosition,
      'Delete Node': generateDeleteNode,
      'Reverse': generateReverse,
      'Detect Cycle': generateDetectCycle,
    };
    const gen = generators[operation];
    if (!gen) throw new Error(`Unknown operation: ${operation}`);
    return gen(inputData);
  },

  render: renderLinkedList,
};
