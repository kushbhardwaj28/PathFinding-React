/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Canvas renderers — one per visualization kind. Every color is a Nocturne
 * ramp step; keep them in sync with visualizer.css if the theme changes.
 */
import type { Frame, VizKind } from './registry';

type Ctx = CanvasRenderingContext2D;

export interface RenderOpts {
  cols?: number;
  rows?: number;
  start?: number | null;
  goal?: number | null;
  square?: boolean;
  /** written back by the grid renderer so the board can hit-test clicks */
  geom?: { cell: number; ox: number; oy: number };
}


const COLORS = {
  empty: '#1d2031', line: '#24273a', wall: '#595d6c',
  frontier: '#796cbf', visited: '#423a6a', path: '#d2cefd',
  start: '#b5abfc', goal: '#e7e5fe',
  idle: '#3f424d', active: '#d2cefd', cmp: '#968ae0', final: '#5d5294',
  edge: '#3f424d', edgeLive: '#968ae0', edgeIn: '#b5abfc', edgeOut: '#2b2741',
  ink: '#161826', text: '#cfd3e5', dim: '#75798c', tint: '#2b2741'
};
const MONO = '"JetBrains Mono", ui-monospace, monospace';

function prep(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#1a1c2b';
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
}

function grid(ctx: Ctx, w: number, h: number, frame: Frame, opts: RenderOpts) {
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

function bars(ctx: Ctx, w: number, h: number, frame: Frame) {
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

function graph(ctx: Ctx, w: number, h: number, frame: Frame) {
  const pad = 34;
  const nodeX = (n: any) => pad + n.x * (w - pad * 2);
  const nodeY = (n: any) => pad + n.y * (h - pad * 2);
  const nodes = frame.graph.nodes;
  frame.graph.edges.forEach((e: number[], i: number) => {
    const nodeA = nodes[e[0]], nodeB = nodes[e[1]];
    const s = frame.es[i];
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
  nodes.forEach((n: any, i: number) => {
    const s = frame.ns[i];
    const x = nodeX(n), y = nodeY(n);
    ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = s === 2 ? COLORS.start : s === 1 ? COLORS.frontier : s === 4 ? '#8c5f74' : '#232532';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = s ? 'transparent' : COLORS.wall;
    ctx.stroke();
    ctx.fillStyle = s ? COLORS.ink : COLORS.text;
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillText(n.label, x, y + 0.5);
  });
}

function tree(ctx: Ctx, w: number, h: number, frame: Frame) {
  const padX = 26, padY = 28;
  const depth = Math.max(1, Math.max(...frame.nodes.map(n => n.d)));
  const nodeX = (n: any) => padX + n.x * (w - padX * 2);
  const nodeY = (n: any) => padY + (n.d / depth) * (h - padY * 2);
  ctx.strokeStyle = COLORS.edge;
  ctx.lineWidth = 1;
  frame.links.forEach(([a, b]: any[]) => {
    if (!a || !b) return;
    ctx.beginPath(); ctx.moveTo(nodeX(a), nodeY(a)); ctx.lineTo(nodeX(b), nodeY(b)); ctx.stroke();
  });
  frame.nodes.forEach((n: any) => {
    const x = nodeX(n), y = nodeY(n);
    ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = n.state === 1 ? COLORS.frontier : n.state === 2 ? COLORS.visited : n.state === 3 ? COLORS.start : '#232532';
    ctx.fill();
    ctx.strokeStyle = n.state ? 'transparent' : COLORS.wall;
    ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = n.state === 1 || n.state === 3 ? COLORS.ink : COLORS.text;
    ctx.font = '500 11px ' + MONO;
    ctx.fillText(String(n.v), x, y + 0.5);
  });
}

function matrix(ctx: Ctx, w: number, h: number, frame: Frame) {
  const rows = frame.vals.length, cols = frame.vals[0].length;
  const lead = 30;
  const cw = Math.min(46, Math.floor((w - lead - 12) / cols));
  const ch = Math.min(34, Math.floor((h - lead - 12) / rows));
  const ox = Math.floor((w - (lead + cw * cols)) / 2) + lead;
  const oy = Math.floor((h - (lead + ch * rows)) / 2) + lead;
  ctx.font = '500 10px ' + MONO;
  frame.colLabels.forEach((l: string, j: number) => {
    ctx.fillStyle = j === frame.c ? COLORS.path : COLORS.dim;
    ctx.fillText(l, ox + j * cw + cw / 2, oy - 13);
  });
  frame.rowLabels.forEach((l: string, i: number) => {
    ctx.fillStyle = i === frame.r ? COLORS.path : COLORS.dim;
    ctx.textAlign = 'right';
    ctx.fillText(l, ox - 8, oy + i * ch + ch / 2);
    ctx.textAlign = 'center';
  });
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = ox + j * cw, y = oy + i * ch;
      const v = frame.vals[i][j];
      const isCur = i === frame.r && j === frame.c;
      const isDep = (i === frame.r - 1 && (j === frame.c || j === frame.c - 1)) || (i === frame.r && j === frame.c - 1);
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

function seq(ctx: Ctx, w: number, h: number, frame: Frame) {
  const n = Math.max(1, frame.items.length);
  const bw = Math.min(70, Math.floor((w - 40) / Math.max(4, n)));
  const bh = 46;
  const vertical = frame.mode === 'stack';
  const cx = w / 2, cy = h / 2;
  frame.items.forEach((it: any, i: number) => {
    let x, y;
    if (vertical) { x = cx - bw / 2; y = cy + (frame.items.length / 2 - i - 1) * (bh * 0.72); }
    else { x = cx - (n * bw) / 2 + i * bw; y = cy - bh / 2; }
    const s = it.state;
    ctx.fillStyle = s === 1 ? COLORS.frontier : s === 2 ? '#3a3168' : s === 4 ? '#5c4657' : '#232532';
    ctx.beginPath(); ctx.roundRect(x + 2, y + 2, bw - 6, bh - 6, 4); ctx.fill();
    ctx.strokeStyle = s === 2 ? COLORS.start : s ? 'transparent' : COLORS.wall;
    ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = s === 1 ? COLORS.ink : COLORS.text;
    ctx.font = '500 13px ' + MONO;
    ctx.fillText(String(it.v), x + (bw - 4) / 2, y + bh / 2);
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

function hash(ctx: Ctx, _w: number, h: number, frame: Frame) {
  const B = frame.buckets.length;
  const rowH = Math.min(30, Math.floor((h - 16) / B));
  const oy = Math.floor((h - rowH * B) / 2);
  const ox = 22;
  const cw = 62;
  for (let i = 0; i < B; i++) {
    const y = oy + i * rowH;
    ctx.fillStyle = i === frame.probe ? '#3a3168' : '#232532';
    ctx.beginPath(); ctx.roundRect(ox, y + 2, 26, rowH - 5, 3); ctx.fill();
    ctx.fillStyle = i === frame.probe ? '#f5f4ff' : COLORS.dim;
    ctx.font = '500 10px ' + MONO;
    ctx.fillText(String(i), ox + 13, y + rowH / 2);
    ctx.strokeStyle = COLORS.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ox + 30, y + rowH / 2); ctx.lineTo(ox + 36, y + rowH / 2); ctx.stroke();
    frame.buckets[i].forEach((e: any, j: number) => {
      const x = ox + 38 + j * (cw + 8);
      const s = e.state;
      ctx.fillStyle = s === 1 ? COLORS.frontier : s === 3 ? COLORS.start : s === 2 ? '#3a3168' : '#282b3a';
      ctx.beginPath(); ctx.roundRect(x, y + 2, cw, rowH - 5, 3); ctx.fill();
      ctx.fillStyle = s === 1 || s === 3 ? COLORS.ink : COLORS.text;
      ctx.font = '500 10.5px ' + MONO;
      ctx.fillText('"' + e.k + '"', x + cw / 2, y + rowH / 2);
      if (j < frame.buckets[i].length - 1) {
        ctx.strokeStyle = COLORS.wall;
        ctx.beginPath(); ctx.moveTo(x + cw, y + rowH / 2); ctx.lineTo(x + cw + 8, y + rowH / 2); ctx.stroke();
      }
    });
  }
}

const RENDERERS: Record<VizKind, (ctx: Ctx, w: number, h: number, frame: Frame, opts: RenderOpts) => void> = { grid, bars, graph, tree, matrix, seq, hash };

export function render(
  canvas: HTMLCanvasElement | null,
  viz: VizKind,
  frame: Frame | undefined,
  opts: RenderOpts = {},
) {
  if (!canvas || !frame) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  if (canvas.width !== Math.round(w * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  prep(ctx, w, h);
  (RENDERERS[viz] || bars)(ctx, w, h, frame, opts);
}
