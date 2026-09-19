import type { Frame, Inputs } from './types';

function createBarWorld(arr: number[]) {
  const a = arr.slice();
  const frames: Frame[] = [];
  const sorted = new Set<number>();
  const snap = (active: number[], cap: string) => frames.push({ arr: a.slice(), active: active.slice(), sorted: new Set(sorted), cap });
  const cmps = { n: 0 };
  snap([], 'unsorted, n = ' + a.length);
  return { a, frames, sorted, snap, cmps };
}

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
