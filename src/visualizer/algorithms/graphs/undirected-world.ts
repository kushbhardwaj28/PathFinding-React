import type { Frame } from '../types';

const GRAPH = {
  nodes: [
    { label: 'A', x: 0.07, y: 0.50 }, { label: 'B', x: 0.28, y: 0.17 }, { label: 'C', x: 0.28, y: 0.83 },
    { label: 'D', x: 0.50, y: 0.50 }, { label: 'E', x: 0.72, y: 0.15 }, { label: 'F', x: 0.72, y: 0.85 },
    { label: 'G', x: 0.93, y: 0.50 }, { label: 'H', x: 0.50, y: 0.07 }
  ],
  edges: [[0, 1, 4], [0, 2, 3], [1, 3, 2], [1, 7, 6], [2, 3, 5], [2, 5, 7], [3, 4, 3], [3, 5, 4], [4, 6, 2], [5, 6, 5], [4, 7, 1], [1, 2, 8]]
};

export function createUndirectedGraphWorld() {
  const { nodes, edges } = GRAPH;
  const nodeStates = new Array(nodes.length).fill(0);
  const edgeStates = new Array(edges.length).fill(0);
  const frames: Frame[] = [];
  const snap = (cap: string) => frames.push({ graph: GRAPH, directed: false, nodeStates: nodeStates.slice(), edgeStates: edgeStates.slice(), cap });
  return { nodes, edges, nodeStates, edgeStates, frames, snap };
}
