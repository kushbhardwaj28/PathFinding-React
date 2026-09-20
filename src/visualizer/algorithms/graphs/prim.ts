import type { Frame } from '../types';
import { createUndirectedGraphWorld } from './undirected-world';

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
