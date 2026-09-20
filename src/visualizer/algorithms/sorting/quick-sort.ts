import type { Frame, Inputs } from '../types';
import { createBarWorld } from './world';

export function quickSortFrames(inputs: Inputs): Frame[] {
  const { a, frames, sorted, snap, cmps } = createBarWorld(inputs.arr);
  const quickSortRange = (lo: number, hi: number): void => {
    if (lo > hi) return;
    if (lo === hi) { sorted.add(lo); snap([lo], 'single element final'); return; }
    const pivot = a[hi];
    let i = lo;
    snap([hi], 'pivot = ' + pivot);
    for (let j = lo; j < hi; j++) {
      cmps.n++; snap([j, hi], a[j] + ' < ' + pivot + ' ?');
      if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; snap([i, j], 'move left'); i++; }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    sorted.add(i); snap([i], 'pivot final at ' + i);
    quickSortRange(lo, i - 1); quickSortRange(i + 1, hi);
  };
  quickSortRange(0, a.length - 1);
  for (let i = 0; i < a.length; i++) sorted.add(i);
  snap([], 'sorted · ' + cmps.n + ' comparisons');
  return frames;
}
