/**
 * Step engine entry point. A "frame" is a complete snapshot the renderer can
 * draw with no knowledge of history, which is what makes step-back free.
 *
 * To add a new algorithm:
 *   1. Add its metadata to ALGOS in catalog.ts.
 *   2. Write a `myAlgoFrames(inputs) => Frame[]` builder in its own file
 *      inside the folder for its family (pathfinding/, sorting/, graphs/,
 *      trees/, dynamic-programming/, data-structures/) and export it from
 *      that folder's index.ts. A new family gets a new folder (and a new
 *      visualization kind also needs a renderer, see renderers/index.ts).
 *   3. Import it below and add one line to ALGORITHM_BUILDERS.
 * Forgetting step 3 is a compile error, since AlgoKey is derived from
 * ALGOS's own keys — see catalog.ts. Full walkthrough in the README.
 */

import type { Frame, Inputs } from './types';
import type { AlgoKey } from './catalog';
import { bfsFrames, dfsFrames, dijkstraFrames, astarFrames } from './pathfinding';
import { bubbleSortFrames, insertionSortFrames, mergeSortFrames, quickSortFrames, heapSortFrames } from './sorting';
import { primFrames, kruskalFrames, topoSortFrames, cycleDetectionFrames } from './graphs';
import { bstInsertFrames, bstSearchFrames, inorderFrames, heapInsertFrames } from './trees';
import { lcsFrames, editDistanceFrames, knapsackFrames } from './dynamic-programming';
import { stackFrames, queueFrames, linkedListFrames, hashTableFrames } from './data-structures';

export * from './types';
export * from './catalog';
export { defaultInputs, randomArray, mazeWalls } from './utils';

/**
 * One entry per algorithm. Adding an algorithm to ALGOS (catalog.ts) without
 * adding its builder here (or vice versa) is a compile error, since AlgoKey
 * is derived from ALGOS's own keys.
 */
const ALGORITHM_BUILDERS: Record<AlgoKey, (inputs: Inputs) => Frame[]> = {
  dijkstra: dijkstraFrames, astar: astarFrames, bfs: bfsFrames, dfs: dfsFrames,
  bubble: bubbleSortFrames, insertion: insertionSortFrames, merge: mergeSortFrames,
  quick: quickSortFrames, heapsort: heapSortFrames,
  prim: primFrames, kruskal: kruskalFrames, topo: topoSortFrames, cycle: cycleDetectionFrames,
  bstInsert: bstInsertFrames, bstSearch: bstSearchFrames, inorder: inorderFrames, heapInsert: heapInsertFrames,
  lcs: lcsFrames, edit: editDistanceFrames, knapsack: knapsackFrames,
  stack: stackFrames, queue: queueFrames, linked: linkedListFrames,
  hash: hashTableFrames,
};

export function buildFrames(key: AlgoKey, inputs: Inputs): Frame[] {
  return ALGORITHM_BUILDERS[key](inputs);
}
