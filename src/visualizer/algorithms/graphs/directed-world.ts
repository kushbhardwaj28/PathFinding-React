import type { Frame } from '../types';

const DIGRAPH = {
  nodes: [
    { label: 'A', x: 0.08, y: 0.50 }, { label: 'B', x: 0.30, y: 0.22 }, { label: 'C', x: 0.30, y: 0.78 },
    { label: 'D', x: 0.52, y: 0.50 }, { label: 'E', x: 0.74, y: 0.22 }, { label: 'F', x: 0.74, y: 0.78 },
    { label: 'G', x: 0.94, y: 0.50 }
  ],
  edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [1, 5]]
};

export function createDigraphWorld(extraEdges: [number, number][] = []) {
  const graph = { nodes: DIGRAPH.nodes, edges: DIGRAPH.edges.concat(extraEdges) };
  const nodeStates = new Array(graph.nodes.length).fill(0);
  const edgeStates = new Array(graph.edges.length).fill(0);
  const frames: Frame[] = [];
  const snap = (cap: string) => frames.push({ graph, directed: true, nodeStates: nodeStates.slice(), edgeStates: edgeStates.slice(), cap });
  return { graph, nodeStates, edgeStates, frames, snap };
}
