import type { Frame, Inputs } from '../types';
import { createBarWorld } from './world';

export function mergeSortFrames(inputs: Inputs): Frame[] {
  const { a, frames, sorted, snap, cmps } = createBarWorld(inputs.arr);
  const mergeSortRange = (lo: number, hi: number): void => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    mergeSortRange(lo, mid); mergeSortRange(mid + 1, hi);
    const left = a.slice(lo, mid + 1), right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      cmps.n++;
      a[k] = left[i] <= right[j] ? left[i++] : right[j++];
      snap([k], 'merge [' + lo + '..' + hi + ']');
      k++;
    }
    while (i < left.length) { a[k] = left[i++]; snap([k], 'drain left'); k++; }
    while (j < right.length) { a[k] = right[j++]; snap([k], 'drain right'); k++; }
    for (let x = lo; x <= hi; x++) sorted.add(x);
    snap([], 'run [' + lo + '..' + hi + '] sorted');
    if (hi - lo + 1 < a.length) for (let x = lo; x <= hi; x++) sorted.delete(x);
  };
  mergeSortRange(0, a.length - 1);
  for (let i = 0; i < a.length; i++) sorted.add(i);
  snap([], 'sorted · ' + cmps.n + ' comparisons');
  return frames;
}
