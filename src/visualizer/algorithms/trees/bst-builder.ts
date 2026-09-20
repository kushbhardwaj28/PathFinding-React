import type { Frame } from '../types';
import { treeSnapshot, type TreeNode } from './tree-layout';

export const BST_INSERT_ORDER = [50, 30, 70, 20, 40, 60, 80, 35];

export function createBstBuilder(frames: Frame[]) {
  let nextNodeId = 0;
  const makeTreeNode = (v: number): TreeNode => ({ value: v, left: null, right: null, id: nextNodeId++, state: 0 });
  let root: TreeNode | null = null;
  const insert = (v: number, trace: boolean) => {
    const node = makeTreeNode(v);
    if (!root) { root = node; if (trace) treeSnapshot(root, 'root = ' + v, frames); return; }
    let cur = root;
    while (true) {
      if (trace) { cur.state = 1; treeSnapshot(root, v + (v < cur.value ? ' < ' : ' ≥ ') + cur.value + ' → go ' + (v < cur.value ? 'left' : 'right'), frames); cur.state = 0; }
      const side = v < cur.value ? 'left' : 'right';
      if (!cur[side]) { cur[side] = node; node.state = trace ? 3 : 0; if (trace) treeSnapshot(root, 'insert ' + v + ' as ' + side + ' child of ' + cur.value, frames); node.state = 0; return; }
      cur = cur[side];
    }
  };
  return { insert, get root() { return root; } };
}
