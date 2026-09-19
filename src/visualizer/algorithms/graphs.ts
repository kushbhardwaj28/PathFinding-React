import type { Frame } from './types';

const GRAPH = {
  nodes: [
    { label: 'A', x: 0.07, y: 0.50 }, { label: 'B', x: 0.28, y: 0.17 }, { label: 'C', x: 0.28, y: 0.83 },
    { label: 'D', x: 0.50, y: 0.50 }, { label: 'E', x: 0.72, y: 0.15 }, { label: 'F', x: 0.72, y: 0.85 },
    { label: 'G', x: 0.93, y: 0.50 }, { label: 'H', x: 0.50, y: 0.07 }
  ],
  edges: [[0, 1, 4], [0, 2, 3], [1, 3, 2], [1, 7, 6], [2, 3, 5], [2, 5, 7], [3, 4, 3], [3, 5, 4], [4, 6, 2], [5, 6, 5], [4, 7, 1], [1, 2, 8]]
};

const DIGRAPH = {
  nodes: [
    { label: 'A', x: 0.08, y: 0.50 }, { label: 'B', x: 0.30, y: 0.22 }, { label: 'C', x: 0.30, y: 0.78 },
    { label: 'D', x: 0.52, y: 0.50 }, { label: 'E', x: 0.74, y: 0.22 }, { label: 'F', x: 0.74, y: 0.78 },
    { label: 'G', x: 0.94, y: 0.50 }
  ],
  edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [1, 5]]
};

function createUndirectedGraphWorld() {
  const { nodes, edges } = GRAPH;
  const nodeStates = new Array(nodes.length).fill(0);
  const edgeStates = new Array(edges.length).fill(0);
  const frames: Frame[] = [];
  const snap = (cap: string) => frames.push({ graph: GRAPH, directed: false, nodeStates: nodeStates.slice(), edgeStates: edgeStates.slice(), cap });
  return { nodes, edges, nodeStates, edgeStates, frames, snap };
}

export function primFrames(): Frame[] {
  const { nodes, edges, nodeStates, edgeStates, frames, snap } = createUndirectedGraphWorld();
  nodeStates[0] = 2; snap('root A in tree');
  let total = 0;
  for (let step = 0; step < nodes.length - 1; step++) {
    let best = -1;
    edges.forEach(([a, b, w], i) => {
      const inA = nodeStates[a] === 2, inB = nodeStates[b] === 2;
      if (inA !== inB) { edgeStates[i] = edgeStates[i] === 3 ? 3 : 1; if (best < 0 || w < edges[best][2]) best = i; }
    });
    if (best < 0) break;
    snap('candidate edges from the tree');
    const [a, b, w] = edges[best];
    edgeStates[best] = 3; nodeStates[a] = 2; nodeStates[b] = 2; total += w;
    edges.forEach((_edge, i) => { if (edgeStates[i] === 1) edgeStates[i] = 0; });
    snap('add ' + nodes[a].label + '–' + nodes[b].label + ' (w ' + w + ') · total ' + total);
  }
  snap('spanning tree weight ' + total);
  return frames;
}

export function kruskalFrames(): Frame[] {
  const { nodes, edges, nodeStates, edgeStates, frames, snap } = createUndirectedGraphWorld();
  const order = edges.map((_edge, i) => i).sort((x, y) => edges[x][2] - edges[y][2]);
  const parent = nodes.map((_, i) => i);
  const find = (x: number): number => parent[x] === x ? x : (parent[x] = find(parent[x]));
  let total = 0, taken = 0;
  snap('edges sorted by weight');
  for (const i of order) {
    const [a, b, w] = edges[i];
    edgeStates[i] = 1; snap('consider ' + nodes[a].label + '–' + nodes[b].label + ' (w ' + w + ')');
    if (find(a) === find(b)) { edgeStates[i] = 4; snap('rejected — closes a cycle'); continue; }
    parent[find(a)] = find(b);
    edgeStates[i] = 3; nodeStates[a] = 2; nodeStates[b] = 2; total += w; taken++;
    snap('accepted · total ' + total);
    if (taken === nodes.length - 1) break;
  }
  snap('spanning tree weight ' + total);
  return frames;
}

function createDigraphWorld(extraEdges: [number, number][] = []) {
  const graph = { nodes: DIGRAPH.nodes, edges: DIGRAPH.edges.concat(extraEdges) };
  const nodeStates = new Array(graph.nodes.length).fill(0);
  const edgeStates = new Array(graph.edges.length).fill(0);
  const frames: Frame[] = [];
  const snap = (cap: string) => frames.push({ graph, directed: true, nodeStates: nodeStates.slice(), edgeStates: edgeStates.slice(), cap });
  return { graph, nodeStates, edgeStates, frames, snap };
}

export function topoSortFrames(): Frame[] {
  const { graph, nodeStates, edgeStates, frames, snap } = createDigraphWorld();
  const deg = new Array(graph.nodes.length).fill(0);
  graph.edges.forEach(([, b]) => deg[b]++);
  const ready = deg.map((d, i) => d === 0 ? i : -1).filter(i => i >= 0);
  ready.forEach(i => { nodeStates[i] = 1; });
  snap('in-degree 0: ' + ready.map(i => graph.nodes[i].label).join(', '));
  const order: string[] = [];
  while (ready.length) {
    const n = ready.shift()!;
    nodeStates[n] = 2; order.push(graph.nodes[n].label);
    snap('emit ' + order.join(' → '));
    graph.edges.forEach(([a, b], i) => {
      if (a !== n) return;
      edgeStates[i] = 3;
      if (--deg[b] === 0) { nodeStates[b] = 1; ready.push(b); }
    });
    snap('dependencies of ' + graph.nodes[n].label + ' consumed');
  }
  snap(order.length === graph.nodes.length ? 'valid order: ' + order.join(' → ') : 'cycle — no valid order');
  return frames;
}

export function cycleDetectionFrames(): Frame[] {
  const { graph, nodeStates, edgeStates, frames, snap } = createDigraphWorld([[6, 1]]);
  const color = new Array(graph.nodes.length).fill(0);
  let cycleFound = false;
  const visit = (n: number): boolean => {
    color[n] = 1; nodeStates[n] = 1; snap(graph.nodes[n].label + ' grey — on the stack');
    for (let i = 0; i < graph.edges.length; i++) {
      const [a, b] = graph.edges[i];
      if (a !== n) continue;
      edgeStates[i] = 1; snap('follow ' + graph.nodes[a].label + ' → ' + graph.nodes[b].label);
      if (color[b] === 1) { edgeStates[i] = 4; nodeStates[b] = 4; nodeStates[a] = 4; snap('back edge — cycle at ' + graph.nodes[b].label); return true; }
      if (color[b] === 0 && visit(b)) return true;
      edgeStates[i] = 3;
    }
    color[n] = 2; nodeStates[n] = 2; snap(graph.nodes[n].label + ' black — finished');
    return false;
  };
  for (let i = 0; i < graph.nodes.length && !cycleFound; i++) if (color[i] === 0) cycleFound = visit(i);
  snap(cycleFound ? 'graph contains a cycle' : 'no back edges — graph is a DAG');
  return frames;
}
