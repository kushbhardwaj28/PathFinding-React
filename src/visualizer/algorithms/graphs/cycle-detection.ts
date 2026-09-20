import type { Frame } from '../types';
import { createDigraphWorld } from './directed-world';

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
