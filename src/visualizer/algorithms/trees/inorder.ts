import type { Frame } from '../types';
import { BST_INSERT_ORDER, createBstBuilder } from './bst-builder';
import { treeSnapshot, type TreeNode } from './tree-layout';

export function inorderFrames(): Frame[] {
  const frames: Frame[] = [];
  const bst = createBstBuilder(frames);
  BST_INSERT_ORDER.forEach(v => bst.insert(v, false));
  const root = bst.root;
  const out: number[] = [];
  const visit = (node: TreeNode | null): void => {
    if (!node) return;
    node.state = 1; treeSnapshot(root, 'descend to ' + node.value, frames); node.state = 0;
    visit(node.left);
    node.state = 3; out.push(node.value);
    treeSnapshot(root, 'emit → ' + out.join(', '), frames);
    visit(node.right);
  };
  visit(root);
  treeSnapshot(root, 'sorted output: ' + out.join(', '), frames);
  return frames;
}
