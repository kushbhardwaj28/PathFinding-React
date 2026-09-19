import type { Frame } from '../algorithms/types';
import type { Ctx } from './types';
import { COLORS, MONO } from './theme';

export function bars(ctx: Ctx, w: number, h: number, frame: Frame) {
  const n = frame.arr.length, pad = 12;
  const bw = (w - pad * 2) / n;
  const max = Math.max(...frame.arr, 1);
  for (let i = 0; i < n; i++) {
    const bh = Math.max(4, ((h - 40) * frame.arr[i]) / max);
    const x = pad + i * bw, y = h - 26 - bh;
    const act = frame.active.indexOf(i) >= 0;
    ctx.fillStyle = act ? (frame.active.length > 1 ? COLORS.cmp : COLORS.active) : frame.sorted.has(i) ? COLORS.final : COLORS.idle;
    ctx.beginPath();
    ctx.roundRect(x + Math.max(0.5, bw * 0.12), y, Math.max(2, bw * 0.76), bh, 2);
    ctx.fill();
    if (act) { ctx.fillStyle = COLORS.active; ctx.fillRect(x + Math.max(0.5, bw * 0.12), y - 3, Math.max(2, bw * 0.76), 2); }
    if (bw > 16) {
      ctx.fillStyle = act ? COLORS.path : COLORS.dim;
      ctx.font = '500 9px ' + MONO;
      ctx.fillText(String(frame.arr[i]), x + bw / 2, h - 14);
    }
  }
}
