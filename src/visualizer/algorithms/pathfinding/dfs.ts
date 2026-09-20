import type { Frame, Inputs } from '../types';
import { createGridWorld } from './world';

export function dfsFrames(inputs: Inputs): Frame[] {
  const { n, cells, snap, start, goal, neighborsOf, tracePathAndFinish } = createGridWorld(inputs);
  const prev = new Map<number, number>();
  const dist = new Map<number, number>([[start, 0]]);
  const seen = new Set<number>();
  const stack: number[] = [start];
  let found = false, guard = n * 6;
  snap('frontier 1');
  while (stack.length && guard-- > 0) {
    const node = stack.pop()!;
    if (seen.has(node)) continue;
    seen.add(node);
    if (node !== start && node !== goal) cells[node] = 3;
    if (node === goal) { found = true; snap('goal reached'); break; }
    for (const neighbor of neighborsOf(node)) {
      if (seen.has(neighbor)) continue;
      const newDistance = (dist.get(node) ?? 0) + 1;
      prev.set(neighbor, node); dist.set(neighbor, newDistance); stack.push(neighbor);
      if (neighbor !== goal && cells[neighbor] !== 3) cells[neighbor] = 2;
    }
    snap('settled ' + seen.size + ' · frontier ' + stack.length);
  }
  return tracePathAndFinish(prev, found);
}
