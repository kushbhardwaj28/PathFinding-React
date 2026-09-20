import type { Frame } from '../types';
import { treeSnapshot, type TreeNode } from './tree-layout';

export function heapInsertFrames(): Frame[] {
  const frames: Frame[] = [];
  const heap = [4, 9, 7, 21, 12, 14, 18];
  const build = (): TreeNode[] => {
    const nodes: TreeNode[] = heap.map((v, i) => ({ value: v, id: i, left: null, right: null, state: 0 }));
    nodes.forEach((n, i) => {
      if (2 * i + 1 < nodes.length) n.left = nodes[2 * i + 1];
      if (2 * i + 2 < nodes.length) n.right = nodes[2 * i + 2];
    });
    return nodes;
  };
  let nodes = build();
  treeSnapshot(nodes[0], 'min-heap · parent ≤ children', frames);
  heap.push(3);
  nodes = build();
  let i = heap.length - 1;
  nodes[i].state = 1;
  treeSnapshot(nodes[0], 'append 3 at the last position', frames);
  while (i > 0) {
    const p = (i - 1) >> 1;
    nodes = build(); nodes[i].state = 1; nodes[p].state = 2;
    treeSnapshot(nodes[0], 'compare with parent ' + heap[p], frames);
    if (heap[p] <= heap[i]) break;
    [heap[p], heap[i]] = [heap[i], heap[p]];
    i = p;
    nodes = build(); nodes[i].state = 3;
    treeSnapshot(nodes[0], 'swap up to index ' + i, frames);
  }
  nodes = build();
  treeSnapshot(nodes[0], 'heap property restored · root = ' + heap[0], frames);
  return frames;
}
