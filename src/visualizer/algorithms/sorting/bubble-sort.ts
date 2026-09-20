import type { Frame, Inputs } from '../types';
import { createBarWorld } from './world';

export function bubbleSortFrames(inputs: Inputs): Frame[] {
  const { a, frames, sorted, snap, cmps } = createBarWorld(inputs.arr);
  for (let end = a.length - 1; end > 0; end--) {
    let swapped = false;
    for (let i = 0; i < end; i++) {
      cmps.n++; snap([i, i + 1], 'compare ' + a[i] + ' : ' + a[i + 1]);
      if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; swapped = true; snap([i, i + 1], 'swap'); }
    }
    sorted.add(end); snap([], 'index ' + end + ' final');
    if (!swapped) break;
  }
  for (let i = 0; i < a.length; i++) sorted.add(i);
  snap([], 'sorted · ' + cmps.n + ' comparisons');
  return frames;
}
