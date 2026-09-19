import type { Frame } from '../algorithms/types';
import type { Ctx } from './types';
import { COLORS, MONO } from './theme';

export function matrix(ctx: Ctx, w: number, h: number, frame: Frame) {
  const rows = frame.vals.length, cols = frame.vals[0].length;
  const lead = 30;
  const cw = Math.min(46, Math.floor((w - lead - 12) / cols));
  const ch = Math.min(34, Math.floor((h - lead - 12) / rows));
  const ox = Math.floor((w - (lead + cw * cols)) / 2) + lead;
  const oy = Math.floor((h - (lead + ch * rows)) / 2) + lead;
  ctx.font = '500 10px ' + MONO;
  frame.colLabels.forEach((l: string, j: number) => {
    ctx.fillStyle = j === frame.col ? COLORS.path : COLORS.dim;
    ctx.fillText(l, ox + j * cw + cw / 2, oy - 13);
  });
  frame.rowLabels.forEach((l: string, i: number) => {
    ctx.fillStyle = i === frame.row ? COLORS.path : COLORS.dim;
    ctx.textAlign = 'right';
    ctx.fillText(l, ox - 8, oy + i * ch + ch / 2);
    ctx.textAlign = 'center';
  });
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = ox + j * cw, y = oy + i * ch;
      const v = frame.vals[i][j];
      const isCur = i === frame.row && j === frame.col;
      const isDep = (i === frame.row - 1 && (j === frame.col || j === frame.col - 1)) || (i === frame.row && j === frame.col - 1);
      ctx.fillStyle = isCur ? '#3a3168' : v === null ? '#1d2031' : isDep ? COLORS.tint : '#232532';
      ctx.beginPath(); ctx.roundRect(x + 1, y + 1, cw - 2, ch - 2, 3); ctx.fill();
      if (isCur) { ctx.strokeStyle = COLORS.start; ctx.lineWidth = 1.5; ctx.stroke(); }
      if (v !== null) {
        ctx.fillStyle = isCur ? '#f5f4ff' : isDep ? COLORS.path : COLORS.text;
        ctx.font = '500 11px ' + MONO;
        ctx.fillText(String(v), x + cw / 2, y + ch / 2 + 0.5);
      }
    }
  }
}
