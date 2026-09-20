import type { Frame, Inputs } from '../types';
import { createBarWorld } from './world';

export function insertionSortFrames(inputs: Inputs): Frame[] {
  const { a, frames, sorted, snap, cmps } = createBarWorld(inputs.arr);
  sorted.add(0);
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    snap([i], 'key = ' + key);
    while (j >= 0 && a[j] > key) { cmps.n++; a[j + 1] = a[j]; j--; snap([j + 1, i], 'shift right'); }
    a[j + 1] = key; sorted.add(i);
    snap([j + 1], 'key placed at ' + (j + 1));
  }
  snap([], 'sorted · ' + cmps.n + ' shifts');
  return frames;
}
