import type { Frame } from '../types';

export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  id: number;
  state: number;
  _layoutOrder?: number;
  _layoutDepth?: number;
}

export interface TreeLayoutNode {
  value: number;
  x: number;
  depth: number;
  id: number;
  state: number;
}

export function layoutTree(root: TreeNode | null): TreeLayoutNode[] {
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

export function treeSnapshot(root: TreeNode | null, cap: string, frames: Frame[]) {
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
