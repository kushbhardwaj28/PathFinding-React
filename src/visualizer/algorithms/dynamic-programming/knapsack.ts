import type { Frame } from '../types';
import { createDPTable } from './dp-table';

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
