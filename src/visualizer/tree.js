// ── Tree Visualizer ──────────────────────────────────────────────────────────
// Renders binary trees with DFS/BFS traversal, BST operations

function buildTree(values) {
  // Build a tree from an array (level-order insertion)
  if (!values || values.length === 0) return null;
  const nodes = values.map(v => v !== null ? { val: v, left: null, right: null } : null);
  for (let i = 0; i < nodes.length; i++) {
    if (!nodes[i]) continue;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < nodes.length) nodes[i].left = nodes[left];
    if (right < nodes.length) nodes[i].right = nodes[right];
  }
  return nodes[0];
}

function layoutTree(root, x, y, xSpread) {
  if (!root) return [];
  const positions = [];
  function recurse(node, cx, cy, spread) {
    if (!node) return;
    positions.push({ node, x: cx, y: cy });
    if (node.left) recurse(node.left, cx - spread, cy + 70, spread / 2);
    if (node.right) recurse(node.right, cx + spread, cy + 70, spread / 2);
  }
  recurse(root, x, y, xSpread);
  return positions;
}

function inorderTrace(root) {
  const order = [];
  function dfs(node) {
    if (!node) return;
    dfs(node.left);
    order.push(node.val);
    dfs(node.right);
  }
  dfs(root);
  return order;
}
function preorderTrace(root) {
  const order = [];
  function dfs(node) {
    if (!node) return;
    order.push(node.val);
    dfs(node.left);
    dfs(node.right);
  }
  dfs(root);
  return order;
}
function postorderTrace(root) {
  const order = [];
  function dfs(node) {
    if (!node) return;
    dfs(node.left);
    dfs(node.right);
    order.push(node.val);
  }
  dfs(root);
  return order;
}
function bfsTrace(root) {
  const levels = [];
  if (!root) return levels;
  let queue = [root];
  while (queue.length) {
    const next = [];
    const levelVals = [];
    for (const node of queue) {
      levelVals.push(node.val);
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    levels.push(levelVals);
    queue = next;
  }
  return levels;
}

const DEFAULT_TREE = [50, 30, 70, 20, 40, 60, 80];

export const treeVisualizer = {
  name: 'Binary Tree',
  operations: ['Inorder Traversal', 'Preorder Traversal', 'Postorder Traversal', 'Level Order (BFS)', 'BST Insert', 'BST Search'],

  generateSteps(operation, inputData) {
    const values = inputData || DEFAULT_TREE;
    const steps = [];

    if (operation === 'Inorder Traversal') {
      const visited = [];
      function inorderSteps(root) {
        if (!root) return;
        steps.push({ visiting: root.val, visited: [...visited], message: `Go LEFT from ${root.val}`, phase: 'left' });
        inorderSteps(root.left);
        visited.push(root.val);
        steps.push({ visiting: root.val, visited: [...visited], message: `Visit node ${root.val}`, phase: 'visit' });
        steps.push({ visiting: root.val, visited: [...visited], message: `Go RIGHT from ${root.val}`, phase: 'right' });
        inorderSteps(root.right);
      }
      const root = buildTree(values);
      steps.push({ visiting: null, visited: [], message: 'Start Inorder: Left → Root → Right', phase: 'start' });
      inorderSteps(root);
      steps.push({ visiting: null, visited: [...inorderTrace(buildTree(values))], message: `Inorder result: [${inorderTrace(buildTree(values)).join(', ')}]`, phase: 'done' });
    }

    if (operation === 'Preorder Traversal') {
      const visited = [];
      function preSteps(root) {
        if (!root) return;
        visited.push(root.val);
        steps.push({ visiting: root.val, visited: [...visited], message: `Visit node ${root.val} (Root first)`, phase: 'visit' });
        preSteps(root.left);
        preSteps(root.right);
      }
      const root = buildTree(values);
      steps.push({ visiting: null, visited: [], message: 'Start Preorder: Root → Left → Right', phase: 'start' });
      preSteps(root);
      steps.push({ visiting: null, visited: [...visited], message: `Preorder result: [${visited.join(', ')}]`, phase: 'done' });
    }

    if (operation === 'Postorder Traversal') {
      const visited = [];
      function postSteps(root) {
        if (!root) return;
        postSteps(root.left);
        postSteps(root.right);
        visited.push(root.val);
        steps.push({ visiting: root.val, visited: [...visited], message: `Visit node ${root.val} (children done)`, phase: 'visit' });
      }
      const root = buildTree(values);
      steps.push({ visiting: null, visited: [], message: 'Start Postorder: Left → Right → Root', phase: 'start' });
      postSteps(root);
      steps.push({ visiting: null, visited: [...visited], message: `Postorder result: [${visited.join(', ')}]`, phase: 'done' });
    }

    if (operation === 'Level Order (BFS)') {
      const root = buildTree(values);
      const allVisited = [];
      const levels = bfsTrace(root);
      steps.push({ visiting: null, visited: [], currentLevel: [], queue: [root.val], message: 'BFS: Start with root in queue', phase: 'start' });
      for (let l = 0; l < levels.length; l++) {
        for (const val of levels[l]) {
          allVisited.push(val);
          steps.push({
            visiting: val, visited: [...allVisited],
            currentLevel: levels[l], queue: l + 1 < levels.length ? levels[l + 1] : [],
            message: `Dequeue ${val} — Level ${l + 1}`, phase: 'visit'
          });
        }
      }
      steps.push({ visiting: null, visited: [...allVisited], message: `BFS complete: [${allVisited.join(', ')}]`, phase: 'done' });
    }

    if (operation === 'BST Insert') {
      const insertVal = 45;
      const pathNodes = [];
      steps.push({ visiting: null, visited: [], path: [], insertVal, message: `Insert ${insertVal} into BST`, phase: 'start' });
      const root = buildTree(values);
      let curr = root;
      while (curr) {
        pathNodes.push(curr.val);
        if (insertVal < curr.val) {
          steps.push({ visiting: curr.val, visited: [], path: [...pathNodes], insertVal, message: `${insertVal} < ${curr.val}: go LEFT`, phase: 'compare' });
          if (!curr.left) { steps.push({ visiting: null, visited: [insertVal], path: [...pathNodes], insertVal, message: `Insert ${insertVal} as left child of ${curr.val}`, phase: 'insert' }); break; }
          curr = curr.left;
        } else {
          steps.push({ visiting: curr.val, visited: [], path: [...pathNodes], insertVal, message: `${insertVal} >= ${curr.val}: go RIGHT`, phase: 'compare' });
          if (!curr.right) { steps.push({ visiting: null, visited: [insertVal], path: [...pathNodes], insertVal, message: `Insert ${insertVal} as right child of ${curr.val}`, phase: 'insert' }); break; }
          curr = curr.right;
        }
      }
    }

    if (operation === 'BST Search') {
      const searchVal = 40;
      const pathNodes = [];
      steps.push({ visiting: null, visited: [], path: [], searchVal, message: `Search for ${searchVal}`, phase: 'start' });
      const root = buildTree(values);
      let curr = root;
      let found = false;
      while (curr) {
        pathNodes.push(curr.val);
        if (curr.val === searchVal) {
          steps.push({ visiting: curr.val, visited: [curr.val], path: [...pathNodes], searchVal, found: true, message: `Found ${searchVal}! ✓`, phase: 'found' });
          found = true; break;
        } else if (searchVal < curr.val) {
          steps.push({ visiting: curr.val, visited: [], path: [...pathNodes], searchVal, message: `${searchVal} < ${curr.val}: go LEFT`, phase: 'compare' });
          curr = curr.left;
        } else {
          steps.push({ visiting: curr.val, visited: [], path: [...pathNodes], searchVal, message: `${searchVal} > ${curr.val}: go RIGHT`, phase: 'compare' });
          curr = curr.right;
        }
      }
      if (!found) steps.push({ visiting: null, visited: [], path: [...pathNodes], searchVal, found: false, message: `${searchVal} not found in BST`, phase: 'notfound' });
    }

    if (steps.length === 0) {
      steps.push({ visiting: null, visited: [], message: 'Select an operation to begin', phase: 'idle' });
    }

    return steps;
  },

  render(ctx, step, W, H) {
    if (!step) return;
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    const values = DEFAULT_TREE;
    const root = buildTree(values);
    const positions = layoutTree(root, W / 2, 50, W / 4);

    const getPos = (val) => positions.find(p => p.node.val === val);
    const R = Math.min(22, W / 20);
    const COLORS = {
      default: '#667eea',
      visiting: '#fbbf24',
      visited: '#10b981',
      path: '#f59e0b',
      found: '#22c55e',
      notfound: '#ef4444',
      insert: '#06b6d4',
    };

    // Draw edges first
    ctx.lineWidth = 2;
    for (const { node, x, y } of positions) {
      if (node.left) {
        const c = getPos(node.left.val);
        if (c) {
          ctx.beginPath();
          ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
          ctx.moveTo(x, y + R);
          ctx.lineTo(c.x, c.y - R);
          ctx.stroke();
        }
      }
      if (node.right) {
        const c = getPos(node.right.val);
        if (c) {
          ctx.beginPath();
          ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
          ctx.moveTo(x, y + R);
          ctx.lineTo(c.x, c.y - R);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const { node, x, y } of positions) {
      let color = COLORS.default;
      const v = node.val;
      const visited = step.visited || [];
      const path = step.path || [];

      if (step.phase === 'found' && step.searchVal === v) color = COLORS.found;
      else if (step.phase === 'notfound' && path.includes(v)) color = COLORS.notfound;
      else if (step.phase === 'insert' && step.visited && step.visited.includes(v)) color = COLORS.insert;
      else if (step.visiting === v) color = COLORS.visiting;
      else if (visited.includes(v)) color = COLORS.visited;
      else if (path.includes(v)) color = COLORS.path;

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Value text
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(10, R * 0.7)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(v), x, y);
    }

    // Message
    if (step.message) {
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.85)';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(step.message, W / 2, H - 10);
    }

    // Queue display for BFS
    if (step.queue && step.queue.length > 0) {
      ctx.fillStyle = 'rgba(102,126,234,0.15)';
      ctx.fillRect(8, H - 50, W - 16, 34);
      ctx.fillStyle = '#667eea';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Queue: [${step.queue.join(', ')}]`, 16, H - 28);
    }
  }
};
