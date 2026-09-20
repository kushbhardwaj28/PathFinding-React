import type { Frame, Inputs } from '../types';

/**
 * Shared grid setup for dijkstra/astar/bfs/dfs: the wall mask, snapshot
 * helper, neighbor lookup and path reconstruction. Deliberately does NOT
 * include the frontier data structure or the enqueue/relax gate — those
 * differ per algorithm (bfs gates on first-seen, dfs has no enqueue gate,
 * dijkstra/astar gate on relaxation with a sorted [priority, node] queue)
 * and stay local to each function below.
 */
export function createGridWorld(inputs: Inputs) {
  const { cols, rows, walls, start, goal } = inputs;
  const n = cols * rows;
  const base = new Uint8Array(n);
  walls.forEach(i => { base[i] = 1; });
  const cells = Uint8Array.from(base);
  const frames: Frame[] = [];
  const snap = (cap: string) => frames.push({ cells: Uint8Array.from(cells), cap });
  const columnOf = (i: number) => i % cols;
  const rowOf = (i: number) => Math.floor(i / cols);
  const manhattanToGoal = (i: number) => Math.abs(columnOf(i) - columnOf(goal)) + Math.abs(rowOf(i) - rowOf(goal));
  const neighborsOf = (i: number) => {
    const col = columnOf(i), row = rowOf(i);
    const result: number[] = [];
    if (row > 0) result.push(i - cols);
    if (col < cols - 1) result.push(i + 1);
    if (row < rows - 1) result.push(i + cols);
    if (col > 0) result.push(i - 1);
    return result.filter(m => !walls.has(m));
  };
  const tracePathAndFinish = (prev: Map<number, number>, found: boolean): Frame[] => {
    if (found) {
      let cur = prev.get(goal), pathLength = 1;
      const chain: number[] = [];
      while (cur !== undefined && cur !== start) { chain.push(cur); cur = prev.get(cur); }
      chain.reverse();
      for (const c of chain) { cells[c] = 4; pathLength++; snap('path length ' + pathLength); }
      snap('path length ' + (pathLength + 1));
    } else {
      snap('goal unreachable');
    }
    return frames;
  };
  return { n, cells, frames, snap, start, goal, neighborsOf, manhattanToGoal, tracePathAndFinish };
}
