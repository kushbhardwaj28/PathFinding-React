import type { Frame, Inputs } from '../types';
import { createGridWorld } from './world';

export function astarFrames(inputs: Inputs): Frame[] {
  const { n, cells, snap, start, goal, neighborsOf, manhattanToGoal, tracePathAndFinish } = createGridWorld(inputs);
  const prev = new Map<number, number>();
  const dist = new Map<number, number>([[start, 0]]);
  const seen = new Set<number>();
  const open: [number, number][] = [[manhattanToGoal(start), start]];
  const enqueue = (node: number, priority: number) => { open.push([priority, node]); open.sort((a, b) => a[0] - b[0]); };
  let found = false, guard = n * 6;
  snap('frontier 1');
  while (open.length && guard-- > 0) {
    const node = open.shift()![1];
    if (seen.has(node)) continue;
    seen.add(node);
    if (node !== start && node !== goal) cells[node] = 3;
    if (node === goal) { found = true; snap('goal reached'); break; }
    for (const neighbor of neighborsOf(node)) {
      if (seen.has(neighbor)) continue;
      const newDistance = (dist.get(node) ?? 0) + 1;
      if (newDistance < (dist.get(neighbor) ?? Infinity)) {
        dist.set(neighbor, newDistance); prev.set(neighbor, node);
        enqueue(neighbor, newDistance + manhattanToGoal(neighbor));
      } else continue;
      if (neighbor !== goal && cells[neighbor] !== 3) cells[neighbor] = 2;
    }
    snap('settled ' + seen.size + ' · frontier ' + open.length);
  }
  return tracePathAndFinish(prev, found);
}
