import type { Frame } from '../types';
import { BST_INSERT_ORDER, createBstBuilder } from './bst-builder';
import { layoutTree, treeSnapshot } from './tree-layout';

export function bstInsertFrames(): Frame[] {
  const frames: Frame[] = [];
  const bst = createBstBuilder(frames);
  BST_INSERT_ORDER.forEach(v => bst.insert(v, true));
  treeSnapshot(bst.root, 'height ' + (1 + Math.max(...layoutTree(bst.root).map(n => n.depth))) + ' for ' + BST_INSERT_ORDER.length + ' keys', frames);
  return frames;
}
