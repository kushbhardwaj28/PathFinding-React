import type { Frame } from '../types';
import { createDPTable } from './dp-table';

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
