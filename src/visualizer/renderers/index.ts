/**
 * Canvas renderers — one file per visualization kind. To support a new
 * VizKind: add it to VizKind in algorithms/types.ts, write a renderer file
 * here, and add one line to RENDERERS below (a missing entry is a compile
 * error). See the README for the full walkthrough.
 */
import type { Frame, VizKind } from '../algorithms/types';
import type { Ctx, RenderOpts } from './types';
import { prep } from './theme';
import { grid } from './grid';
import { bars } from './bars';
import { graph } from './graph';
import { tree } from './tree';
import { matrix } from './matrix';
import { seq } from './seq';
import { hash } from './hash';

export type { RenderOpts } from './types';

const RENDERERS: Record<VizKind, (ctx: Ctx, w: number, h: number, frame: Frame, opts: RenderOpts) => void> = {
  grid, bars, graph, tree, matrix, seq, hash,
};

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
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  prep(ctx, w, h);
  RENDERERS[viz](ctx, w, h, frame, opts);
}
