import type { Frame } from '../algorithms/types';
import type { Ctx } from './types';
import { COLORS, MONO } from './theme';

export function tree(ctx: Ctx, w: number, h: number, frame: Frame) {
  const padX = 26, padY = 28;
  const depth = Math.max(1, Math.max(...frame.nodes.map((node: { depth: number }) => node.depth)));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeX = (node: any) => padX + node.x * (w - padX * 2);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeY = (node: any) => padY + (node.depth / depth) * (h - padY * 2);
  ctx.strokeStyle = COLORS.edge;
  ctx.lineWidth = 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  frame.links.forEach(([a, b]: any[]) => {
    if (!a || !b) return;
    ctx.beginPath(); ctx.moveTo(nodeX(a), nodeY(a)); ctx.lineTo(nodeX(b), nodeY(b)); ctx.stroke();
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  frame.nodes.forEach((node: any) => {
    const x = nodeX(node), y = nodeY(node);
    ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = node.state === 1 ? COLORS.frontier : node.state === 2 ? COLORS.visited : node.state === 3 ? COLORS.start : '#232532';
    ctx.fill();
    ctx.strokeStyle = node.state ? 'transparent' : COLORS.wall;
    ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = node.state === 1 || node.state === 3 ? COLORS.ink : COLORS.text;
    ctx.font = '500 11px ' + MONO;
    ctx.fillText(String(node.value), x, y + 0.5);
  });
}
