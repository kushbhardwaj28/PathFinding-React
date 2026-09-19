import type { Frame } from './types';

const BST_SEQ = [50, 30, 70, 20, 40, 60, 80, 35];

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  id: number;
  state: number;
  _layoutOrder?: number;
  _layoutDepth?: number;
}

interface TreeLayoutNode {
  value: number;
  x: number;
  depth: number;
  id: number;
  state: number;
}

function layoutTree(root: TreeNode | null): TreeLayoutNode[] {
  const nodes: TreeNode[] = [];
  let order = 0;
  const walk = (node: TreeNode | null, depth: number) => {
    if (!node) return;
    walk(node.left, depth + 1);
    node._layoutOrder = order++; node._layoutDepth = depth;
    nodes.push(node);
    walk(node.right, depth + 1);
  };
  walk(root, 0);
  const span = Math.max(1, order - 1);
  return nodes.map(n => ({ value: n.value, x: n._layoutOrder! / span, depth: n._layoutDepth!, id: n.id, state: n.state || 0 }));
}

function treeSnapshot(root: TreeNode | null, cap: string, frames: Frame[]) {
  const nodes = layoutTree(root);
  const byId = new Map(nodes.map(n => [n.id, n]));
  const links: [TreeLayoutNode, TreeLayoutNode][] = [];
  const walk = (node: TreeNode | null) => {
    if (!node) return;
    (['left', 'right'] as const).forEach(side => {
      const child = node[side];
      if (child) { links.push([byId.get(node.id)!, byId.get(child.id)!]); walk(child); }
    });
  };
  walk(root);
  frames.push({ nodes, links, cap });
}

function createBstBuilder(frames: Frame[]) {
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

export function bstInsertFrames(): Frame[] {
  const frames: Frame[] = [];
  const bst = createBstBuilder(frames);
  BST_SEQ.forEach(v => bst.insert(v, true));
  treeSnapshot(bst.root, 'height ' + (1 + Math.max(...layoutTree(bst.root).map(n => n.depth))) + ' for ' + BST_SEQ.length + ' keys', frames);
  return frames;
}

export function bstSearchFrames(): Frame[] {
  const frames: Frame[] = [];
  const bst = createBstBuilder(frames);
  BST_SEQ.forEach(v => bst.insert(v, false));
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

export function inorderFrames(): Frame[] {
  const frames: Frame[] = [];
  const bst = createBstBuilder(frames);
  BST_SEQ.forEach(v => bst.insert(v, false));
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
