// ── Graph Visualizer ─────────────────────────────────────────────────────────

const DEFAULT_GRAPH = {
  nodes: [0, 1, 2, 3, 4, 5],
  edges: [[0,1],[0,2],[1,3],[2,3],[3,4],[4,5],[2,5]],
  weights: { '0-1': 4, '0-2': 2, '1-3': 5, '2-3': 1, '3-4': 3, '4-5': 6, '2-5': 8 }
};

function circleLayout(nodes, cx, cy, r) {
  const pos = {};
  nodes.forEach((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    pos[n] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  return pos;
}

export const graphVisualizer = {
  name: 'Graph',
  operations: ['BFS Traversal', 'DFS Traversal', 'Dijkstra Shortest Path', 'Topological Sort'],

  generateSteps(operation, inputData) {
    const graph = inputData || DEFAULT_GRAPH;
    const { nodes, edges, weights } = graph;
    const adj = {};
    nodes.forEach(n => { adj[n] = []; });
    edges.forEach(([u, v]) => {
      adj[u].push(v);
      adj[v].push(u);
    });
    const steps = [];

    if (operation === 'BFS Traversal') {
      const visited = new Set();
      const queue = [0];
      visited.add(0);
      steps.push({ visited: [], inQueue: [0], current: null, message: 'BFS: Start from node 0, add to queue' });

      while (queue.length) {
        const curr = queue.shift();
        steps.push({ visited: [...visited], inQueue: [...queue], current: curr, message: `Dequeue node ${curr}, explore neighbors` });
        for (const nbr of adj[curr]) {
          if (!visited.has(nbr)) {
            visited.add(nbr);
            queue.push(nbr);
            steps.push({ visited: [...visited], inQueue: [...queue], current: curr, message: `Add unvisited neighbor ${nbr} to queue` });
          }
        }
      }
      steps.push({ visited: [...visited], inQueue: [], current: null, message: `BFS complete! Order: [${[...visited].join(' → ')}]` });
    }

    if (operation === 'DFS Traversal') {
      const visited = [];
      const stack = [];
      function dfsStep(node) {
        visited.push(node);
        steps.push({ visited: [...visited], stack: [...stack, node], current: node, message: `Visit node ${node}` });
        for (const nbr of (adj[node] || [])) {
          if (!visited.includes(nbr)) {
            stack.push(node);
            steps.push({ visited: [...visited], stack: [...stack], current: nbr, message: `Go deep to ${nbr} from ${node}` });
            dfsStep(nbr);
            stack.pop();
          }
        }
      }
      steps.push({ visited: [], stack: [], current: null, message: 'DFS: Start from node 0' });
      dfsStep(0);
      steps.push({ visited: [...visited], stack: [], current: null, message: `DFS complete! Order: [${visited.join(' → ')}]` });
    }

    if (operation === 'Dijkstra Shortest Path') {
      const dist = {};
      const prev = {};
      const settled = new Set();
      nodes.forEach(n => { dist[n] = Infinity; prev[n] = null; });
      dist[0] = 0;

      steps.push({ dist: { ...dist }, settled: [], current: null, message: 'Dijkstra: Initialize dist[0]=0, others=∞' });

      for (let iter = 0; iter < nodes.length; iter++) {
        let minNode = null;
        nodes.forEach(n => {
          if (!settled.has(n) && (minNode === null || dist[n] < dist[minNode])) minNode = n;
        });
        if (minNode === null || dist[minNode] === Infinity) break;

        settled.add(minNode);
        steps.push({ dist: { ...dist }, settled: [...settled], current: minNode, message: `Pick closest unvisited: node ${minNode} (dist=${dist[minNode]})` });

        for (const [u, v] of edges) {
          let neighbor = null, edgeKey = null;
          if (u === minNode) { neighbor = v; edgeKey = `${u}-${v}`; }
          else if (v === minNode) { neighbor = u; edgeKey = `${u}-${v}`; }
          if (neighbor !== null && !settled.has(neighbor)) {
            const w = (weights && weights[edgeKey]) || 1;
            const newDist = dist[minNode] + w;
            if (newDist < dist[neighbor]) {
              dist[neighbor] = newDist;
              prev[neighbor] = minNode;
              steps.push({ dist: { ...dist }, settled: [...settled], current: minNode, relaxing: neighbor, message: `Relax: dist[${neighbor}] = ${newDist} (via ${minNode})` });
            }
          }
        }
      }
      steps.push({ dist: { ...dist }, settled: [...settled], current: null, message: 'Dijkstra complete! Distances from node 0 calculated.' });
    }

    if (operation === 'Topological Sort') {
      // For directed DAG — use nodes/edges as directed
      const inDegree = {};
      const adjDir = {};
      nodes.forEach(n => { inDegree[n] = 0; adjDir[n] = []; });
      edges.forEach(([u, v]) => { adjDir[u].push(v); inDegree[v]++; });

      const queue = nodes.filter(n => inDegree[n] === 0);
      const order = [];
      steps.push({ order: [], inQueue: [...queue], message: 'Topo Sort: Add all nodes with in-degree 0', inDegree: { ...inDegree } });

      while (queue.length) {
        const curr = queue.shift();
        order.push(curr);
        steps.push({ order: [...order], current: curr, inQueue: [...queue], message: `Process node ${curr}`, inDegree: { ...inDegree } });
        for (const nbr of (adjDir[curr] || [])) {
          inDegree[nbr]--;
          if (inDegree[nbr] === 0) {
            queue.push(nbr);
            steps.push({ order: [...order], current: curr, inQueue: [...queue], inDegree: { ...inDegree }, message: `${nbr} has in-degree 0, add to queue` });
          }
        }
      }
      steps.push({ order: [...order], current: null, inQueue: [], message: `Topological order: [${order.join(' → ')}]` });
    }

    if (steps.length === 0) steps.push({ visited: [], message: 'Select an operation to visualize', current: null });
    return steps;
  },

  render(ctx, step, W, H) {
    if (!step) return;
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    const { nodes, edges, weights } = DEFAULT_GRAPH;
    const R = Math.min(20, W / 18);
    const cx = W / 2, cy = (H - 60) / 2 + 20;
    const layoutR = Math.min(cx - R - 20, cy - R - 20);
    const pos = circleLayout(nodes, cx, cy, layoutR);

    const COLORS = {
      default: '#475569',
      visited: '#10b981',
      current: '#f59e0b',
      inQueue: '#667eea',
      settled: '#06b6d4',
      relaxing: '#f093fb',
    };

    const visited = step.visited || [];
    const inQueue = step.inQueue || [];
    const settled = step.settled || [];

    // Draw edges
    edges.forEach(([u, v]) => {
      const pu = pos[u], pv = pos[v];
      if (!pu || !pv) return;
      ctx.beginPath();
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.moveTo(pu.x, pu.y);
      ctx.lineTo(pv.x, pv.y);
      ctx.stroke();

      // Edge weight
      if (weights) {
        const key1 = `${u}-${v}`, key2 = `${v}-${u}`;
        const w = weights[key1] || weights[key2];
        if (w) {
          const mx = (pu.x + pv.x) / 2, my = (pu.y + pv.y) / 2;
          ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(w), mx, my - 8);
        }
      }
    });

    // Draw nodes
    nodes.forEach(n => {
      const p = pos[n];
      if (!p) return;
      let color = COLORS.default;
      if (step.current === n) color = COLORS.current;
      else if (settled.includes(n)) color = COLORS.settled;
      else if (inQueue.includes(n)) color = COLORS.inQueue;
      else if (visited.includes(n)) color = COLORS.visited;

      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(10, R * 0.7)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(n), p.x, p.y);

      // Distance label (Dijkstra)
      if (step.dist) {
        const d = step.dist[n];
        ctx.fillStyle = d === Infinity ? '#94a3b8' : '#fbbf24';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d === Infinity ? '∞' : String(d), p.x, p.y - R - 8);
      }
    });

    // Message
    if (step.message) {
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.85)';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(step.message, W / 2, H - 10);
    }

    // Queue/Stack display
    if (step.inQueue && step.inQueue.length > 0) {
      ctx.fillStyle = 'rgba(102,126,234,0.15)';
      ctx.fillRect(8, H - 48, W - 16, 30);
      ctx.fillStyle = '#667eea';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Queue/Stack: [${step.inQueue.join(', ')}]`, 16, H - 27);
    }
  }
};
