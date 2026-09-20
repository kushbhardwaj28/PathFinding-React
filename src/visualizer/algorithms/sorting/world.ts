import type { Frame } from '../types';

export function createBarWorld(arr: number[]) {
  const a = arr.slice();
  const frames: Frame[] = [];
  const sorted = new Set<number>();
  const snap = (active: number[], cap: string) => frames.push({ arr: a.slice(), active: active.slice(), sorted: new Set(sorted), cap });
  const cmps = { n: 0 };
  snap([], 'unsorted, n = ' + a.length);
  return { a, frames, sorted, snap, cmps };
}
