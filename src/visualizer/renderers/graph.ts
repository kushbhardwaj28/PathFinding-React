import type { Frame } from '../algorithms/types';
import type { Ctx } from './types';
import { COLORS, MONO } from './theme';

export function graph(ctx: Ctx, w: number, h: number, frame: Frame) {
  const pad = 34;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeX = (node: any) => pad + node.x * (w - pad * 2);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeY = (node: any) => pad + node.y * (h - pad * 2);
  const nodes = frame.graph.nodes;
  frame.graph.edges.forEach((e: number[], i: number) => {
    const nodeA = nodes[e[0]], nodeB = nodes[e[1]];
    const s = frame.edgeStates[i];
    ctx.strokeStyle = s === 3 ? COLORS.edgeIn : s === 1 ? COLORS.edgeLive : s === 4 ? '#6b4b5e' : COLORS.edge;
    ctx.lineWidth = s === 3 ? 2.5 : s === 1 ? 2 : 1;
    if (s === 4) ctx.setLineDash([4, 3]); else ctx.setLineDash([]);
    const x1 = nodeX(nodeA), y1 = nodeY(nodeA), x2 = nodeX(nodeB), y2 = nodeY(nodeB);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([]);
    if (frame.directed) {
      const a = Math.atan2(y2 - y1, x2 - x1), r = 15;
      const arrowX = x2 - Math.cos(a) * r, arrowY = y2 - Math.sin(a) * r;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - Math.cos(a - 0.4) * 8, arrowY - Math.sin(a - 0.4) * 8);
      ctx.lineTo(arrowX - Math.cos(a + 0.4) * 8, arrowY - Math.sin(a + 0.4) * 8);
      ctx.closePath(); ctx.fill();
    } else {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      ctx.fillStyle = '#1a1c2b';
      ctx.beginPath(); ctx.roundRect(mx - 9, my - 8, 18, 15, 3); ctx.fill();
      ctx.fillStyle = s === 3 ? COLORS.path : s === 1 ? COLORS.cmp : COLORS.dim;
      ctx.font = '500 10px ' + MONO;
      ctx.fillText(String(e[2]), mx, my);
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes.forEach((node: any, i: number) => {
    const s = frame.nodeStates[i];
    const x = nodeX(node), y = nodeY(node);
    ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = s === 2 ? COLORS.start : s === 1 ? COLORS.frontier : s === 4 ? '#8c5f74' : '#232532';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = s ? 'transparent' : COLORS.wall;
    ctx.stroke();
    ctx.fillStyle = s ? COLORS.ink : COLORS.text;
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillText(node.label, x, y + 0.5);
  });
}
