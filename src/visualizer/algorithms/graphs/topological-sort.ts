import type { Frame } from '../types';
import { createDigraphWorld } from './directed-world';

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
