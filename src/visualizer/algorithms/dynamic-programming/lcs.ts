import type { Frame } from '../types';
import { createDPTable } from './dp-table';

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
