import type { Frame } from './types';

interface DPTableOptions {
  rows: number;
  cols: number;
  rowLabels: string[];
  colLabels: string[];
  rowTitle: string;
  colTitle: string;
}

function createDPTable(opts: DPTableOptions) {
  const { rows, cols, rowLabels, colLabels, rowTitle, colTitle } = opts;
  const dp: (number | null)[][] = Array.from({ length: rows }, () => new Array(cols).fill(null));
  const frames: Frame[] = [];
  const snap = (row: number, col: number, cap: string) => frames.push({ vals: dp.map(r => r.slice()), row, col, rowLabels, colLabels, rowTitle, colTitle, cap });
  return { dp, frames, snap };
}

export function lcsFrames(): Frame[] {
  const a = 'AGGTAB', b = 'GXTXAYB';
  const { dp, frames, snap } = createDPTable({
    rows: a.length + 1, cols: b.length + 1,
    rowLabels: ['∅'].concat(a.split('')), colLabels: ['∅'].concat(b.split('')),
    rowTitle: a, colTitle: b,
  });
  for (let i = 0; i <= a.length; i++) dp[i][0] = 0;
  for (let j = 0; j <= b.length; j++) dp[0][j] = 0;
  snap(0, 0, 'empty prefix → 0');
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const match = a[i - 1] === b[j - 1];
      dp[i][j] = match ? dp[i - 1][j - 1]! + 1 : Math.max(dp[i - 1][j]!, dp[i][j - 1]!);
      snap(i, j, match ? a[i - 1] + ' = ' + b[j - 1] + ' → diagonal + 1 = ' + dp[i][j] : a[i - 1] + ' ≠ ' + b[j - 1] + ' → max(up, left) = ' + dp[i][j]);
    }
  }
  snap(a.length, b.length, 'LCS length ' + dp[a.length][b.length]);
  return frames;
}

export function editDistanceFrames(): Frame[] {
  const a = 'kitten', b = 'sitting';
  const { dp, frames, snap } = createDPTable({
    rows: a.length + 1, cols: b.length + 1,
    rowLabels: ['∅'].concat(a.split('')), colLabels: ['∅'].concat(b.split('')),
    rowTitle: a, colTitle: b,
  });
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  snap(0, 0, 'baselines: pure insert / pure delete');
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j]! + 1, dp[i][j - 1]! + 1, dp[i - 1][j - 1]! + cost);
      snap(i, j, cost === 0 ? a[i - 1] + ' = ' + b[j - 1] + ' → carry diagonal ' + dp[i][j] : 'min(ins, del, sub) = ' + dp[i][j]);
    }
  }
  snap(a.length, b.length, a + ' → ' + b + ' in ' + dp[a.length][b.length] + ' edits');
  return frames;
}

export function knapsackFrames(): Frame[] {
  const items = [{ w: 2, v: 3 }, { w: 3, v: 4 }, { w: 4, v: 5 }, { w: 5, v: 8 }];
  const capacity = 8;
  const { dp, frames, snap } = createDPTable({
    rows: items.length + 1, cols: capacity + 1,
    rowLabels: ['∅'].concat(items.map(it => 'w' + it.w + ' v' + it.v)),
    colLabels: Array.from({ length: capacity + 1 }, (_, w) => String(w)),
    rowTitle: 'items', colTitle: 'capacity',
  });
  for (let w = 0; w <= capacity; w++) dp[0][w] = 0;
  snap(0, 0, 'no items → value 0 at every capacity');
  for (let i = 1; i <= items.length; i++) {
    for (let w = 0; w <= capacity; w++) {
      const { w: wt, v } = items[i - 1];
      dp[i][w] = wt <= w ? Math.max(dp[i - 1][w]!, dp[i - 1][w - wt]! + v) : dp[i - 1][w];
      snap(i, w, wt <= w ? 'take ' + v + ' + dp[' + (i - 1) + '][' + (w - wt) + '] or skip → ' + dp[i][w] : 'item too heavy → inherit ' + dp[i][w]);
    }
  }
  snap(items.length, capacity, 'best value ' + dp[items.length][capacity] + ' within capacity ' + capacity);
  return frames;
}
