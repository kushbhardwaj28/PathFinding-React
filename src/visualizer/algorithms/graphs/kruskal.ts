import type { Frame } from '../types';
import { createUndirectedGraphWorld } from './undirected-world';

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
