import type { Frame, Inputs } from '../types';
import { createBarWorld } from './world';

export function heapSortFrames(inputs: Inputs): Frame[] {
  const { a, frames, sorted, snap, cmps } = createBarWorld(inputs.arr);
  const n = a.length;
  const sift = (i: number, len: number) => {
    while (true) {
      let big = i; const l = 2 * i + 1, r = l + 1;
      if (l < len && a[l] > a[big]) big = l;
      if (r < len && a[r] > a[big]) big = r;
      if (big === i) return;
      [a[i], a[big]] = [a[big], a[i]];
      cmps.n++; snap([i, big], 'sift down');
      i = big;
    }
  };
  for (let i = (n >> 1) - 1; i >= 0; i--) { snap([i], 'heapify from ' + i); sift(i, n); }
  snap([], 'max-heap built');
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    sorted.add(end); snap([0, end], 'root to index ' + end);
    sift(0, end);
  }
  sorted.add(0); snap([], 'sorted · ' + cmps.n + ' sift steps');
  return frames;
}
