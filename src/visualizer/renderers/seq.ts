import type { Frame } from '../algorithms/types';
import type { Ctx } from './types';
import { COLORS, MONO } from './theme';

export function seq(ctx: Ctx, w: number, h: number, frame: Frame) {
  const n = Math.max(1, frame.items.length);
  const bw = Math.min(70, Math.floor((w - 40) / Math.max(4, n)));
  const bh = 46;
  const vertical = frame.mode === 'stack';
  const cx = w / 2, cy = h / 2;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  frame.items.forEach((item: any, i: number) => {
    let x, y;
    if (vertical) { x = cx - bw / 2; y = cy + (frame.items.length / 2 - i - 1) * (bh * 0.72); }
    else { x = cx - (n * bw) / 2 + i * bw; y = cy - bh / 2; }
    const s = item.state;
    ctx.fillStyle = s === 1 ? COLORS.frontier : s === 2 ? '#3a3168' : s === 4 ? '#5c4657' : '#232532';
    ctx.beginPath(); ctx.roundRect(x + 2, y + 2, bw - 6, bh - 6, 4); ctx.fill();
    ctx.strokeStyle = s === 2 ? COLORS.start : s ? 'transparent' : COLORS.wall;
    ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = s === 1 ? COLORS.ink : COLORS.text;
    ctx.font = '500 13px ' + MONO;
    ctx.fillText(String(item.value), x + (bw - 4) / 2, y + bh / 2);
    if (!vertical && i < frame.items.length - 1 && frame.mode === 'linked') {
      ctx.strokeStyle = COLORS.wall; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + bw - 4, y + bh / 2); ctx.lineTo(x + bw + 2, y + bh / 2); ctx.stroke();
    }
  });
  if (frame.ptr) {
    ctx.fillStyle = COLORS.dim;
    ctx.font = '500 11px ' + MONO;
    ctx.fillText(frame.ptr, cx, vertical ? h - 18 : cy + bh + 16);
  }
  if (!frame.items.length) {
    ctx.fillStyle = COLORS.dim;
    ctx.font = '500 12px ' + MONO;
    ctx.fillText('∅', cx, cy);
  }
}
