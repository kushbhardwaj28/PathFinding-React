import type { Frame } from '../types';

export interface DPTableOptions {
  rows: number;
  cols: number;
  rowLabels: string[];
  colLabels: string[];
  rowTitle: string;
  colTitle: string;
}

export function createDPTable(opts: DPTableOptions) {
  const { rows, cols, rowLabels, colLabels, rowTitle, colTitle } = opts;
  const dp: (number | null)[][] = Array.from({ length: rows }, () => new Array(cols).fill(null));
  const frames: Frame[] = [];
  const snap = (row: number, col: number, cap: string) => frames.push({ vals: dp.map(r => r.slice()), row, col, rowLabels, colLabels, rowTitle, colTitle, cap });
  return { dp, frames, snap };
}
