import type { Frame } from '../types';
import { BST_INSERT_ORDER, createBstBuilder } from './bst-builder';
import { treeSnapshot } from './tree-layout';

export function bstSearchFrames(): Frame[] {
  const frames: Frame[] = [];
  const bst = createBstBuilder(frames);
  BST_INSERT_ORDER.forEach(v => bst.insert(v, false));
  const root = bst.root;
  const target = 35;
  treeSnapshot(root, 'search for ' + target, frames);
  let cur = root;
  while (cur) {
    cur.state = 1;
    treeSnapshot(root, 'visit ' + cur.value, frames);
    if (cur.value === target) { cur.state = 3; treeSnapshot(root, 'found after this path', frames); break; }
    cur.state = 2;
    const side = target < cur.value ? 'left' : 'right';
    treeSnapshot(root, target + (target < cur.value ? ' < ' : ' > ') + cur.value + ' → discard ' + (side === 'left' ? 'right' : 'left') + ' subtree', frames);
    cur = cur[side];
  }
  return frames;
}
