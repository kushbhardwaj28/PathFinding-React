import type { Frame } from '../algorithms/types';
import type { Ctx } from './types';
import { COLORS, MONO } from './theme';

export function hash(ctx: Ctx, _w: number, h: number, frame: Frame) {
  const bucketCount = frame.buckets.length;
  const rowHeight = Math.min(30, Math.floor((h - 16) / bucketCount));
  const oy = Math.floor((h - rowHeight * bucketCount) / 2);
  const ox = 22;
  const entryWidth = 62;
  for (let i = 0; i < bucketCount; i++) {
    const y = oy + i * rowHeight;
    ctx.fillStyle = i === frame.probe ? '#3a3168' : '#232532';
    ctx.beginPath(); ctx.roundRect(ox, y + 2, 26, rowHeight - 5, 3); ctx.fill();
    ctx.fillStyle = i === frame.probe ? '#f5f4ff' : COLORS.dim;
    ctx.font = '500 10px ' + MONO;
    ctx.fillText(String(i), ox + 13, y + rowHeight / 2);
    ctx.strokeStyle = COLORS.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ox + 30, y + rowHeight / 2); ctx.lineTo(ox + 36, y + rowHeight / 2); ctx.stroke();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frame.buckets[i].forEach((entry: any, j: number) => {
      const x = ox + 38 + j * (entryWidth + 8);
      const s = entry.state;
      ctx.fillStyle = s === 1 ? COLORS.frontier : s === 3 ? COLORS.start : s === 2 ? '#3a3168' : '#282b3a';
      ctx.beginPath(); ctx.roundRect(x, y + 2, entryWidth, rowHeight - 5, 3); ctx.fill();
      ctx.fillStyle = s === 1 || s === 3 ? COLORS.ink : COLORS.text;
      ctx.font = '500 10.5px ' + MONO;
      ctx.fillText('"' + entry.key + '"', x + entryWidth / 2, y + rowHeight / 2);
      if (j < frame.buckets[i].length - 1) {
        ctx.strokeStyle = COLORS.wall;
        ctx.beginPath(); ctx.moveTo(x + entryWidth, y + rowHeight / 2); ctx.lineTo(x + entryWidth + 8, y + rowHeight / 2); ctx.stroke();
      }
    });
  }
}
