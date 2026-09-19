/**
 * Every color here is a Nocturne ramp step; keep them in sync with
 * visualizer.css if the theme changes.
 */
import type { Ctx } from './types';

export const COLORS = {
  empty: '#1d2031', line: '#24273a', wall: '#595d6c',
  frontier: '#796cbf', visited: '#423a6a', path: '#d2cefd',
  start: '#b5abfc', goal: '#e7e5fe',
  idle: '#3f424d', active: '#d2cefd', cmp: '#968ae0', final: '#5d5294',
  edge: '#3f424d', edgeLive: '#968ae0', edgeIn: '#b5abfc', edgeOut: '#2b2741',
  ink: '#161826', text: '#cfd3e5', dim: '#75798c', tint: '#2b2741'
};

export const MONO = '"JetBrains Mono", ui-monospace, monospace';

export function prep(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#1a1c2b';
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
}
