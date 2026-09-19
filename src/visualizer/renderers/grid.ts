import type { Frame } from '../algorithms/types';
import type { Ctx, RenderOpts } from './types';
import { COLORS } from './theme';

export function grid(ctx: Ctx, w: number, h: number, frame: Frame, opts: RenderOpts) {
  const { cols, rows, start, goal } = opts;
  const cell = Math.max(5, Math.min(Math.floor((w - 8) / cols), Math.floor((h - 8) / rows)));
  const ox = Math.floor((w - cell * cols) / 2), oy = Math.floor((h - cell * rows) / 2);
  opts.geom = { cell, ox, oy };
  for (let i = 0; i < cols * rows; i++) {
    const x = ox + (i % cols) * cell, y = oy + Math.floor(i / cols) * cell;
    const s = frame.cells[i];
    ctx.fillStyle = s === 1 ? COLORS.wall : s === 2 ? COLORS.frontier : s === 3 ? COLORS.visited : s === 4 ? COLORS.path : COLORS.empty;
    if (s) { ctx.beginPath(); ctx.roundRect(x + 1, y + 1, cell - 2, cell - 2, opts.square ? 0 : 2); ctx.fill(); }
    else {
      ctx.fillRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      ctx.strokeStyle = COLORS.line; ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
    }
  }
  const mark = (i: number | null, color: string, glyph: string) => {
    if (i == null) return;
    const x = ox + (i % cols) * cell, y = oy + Math.floor(i / cols) * cell;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(x + 1, y + 1, cell - 2, cell - 2, 3); ctx.fill();
    ctx.fillStyle = COLORS.ink;
    ctx.font = '600 ' + Math.max(7, cell - 6) + 'px Inter, sans-serif';
    ctx.fillText(glyph, x + cell / 2, y + cell / 2 + 0.5);
  };
  mark(start, COLORS.start, 'S');
  mark(goal, COLORS.goal, 'G');
}
