import type { Inputs } from './types';

export function defaultInputs(): Inputs {
  const cols = 40, rows = 20;
  return {
    cols, rows, walls: new Set(),
    start: Math.floor(rows / 2) * cols + 3,
    goal: Math.floor(rows / 2) * cols + (cols - 4),
    arr: randomArray(28)
  };
}

export function randomArray(n: number): number[] {
  return Array.from({ length: n }, () => 6 + Math.floor(Math.random() * 94));
}

export function mazeWalls(cols: number, rows: number, start: number, goal: number): Set<number> {
  const walls = new Set<number>();
  const add = (x: number, y: number) => { const i = y * cols + x; if (i !== start && i !== goal) walls.add(i); };
  for (let x = 0; x < cols; x++) { add(x, 0); add(x, rows - 1); }
  for (let y = 0; y < rows; y++) { add(0, y); add(cols - 1, y); }
  const divide = (x0: number, y0: number, x1: number, y1: number, depth: number): void => {
    const w = x1 - x0, h = y1 - y0;
    if (w < 4 || h < 4 || depth > 7) return;
    if (w > h) {
      const wx = x0 + 2 + 2 * Math.floor(Math.random() * Math.max(1, (w - 3) / 2));
      const gap = y0 + Math.floor(Math.random() * Math.max(1, h));
      for (let y = y0; y <= y1; y++) if (y !== gap) add(wx, y);
      divide(x0, y0, wx - 1, y1, depth + 1); divide(wx + 1, y0, x1, y1, depth + 1);
    } else {
      const wy = y0 + 2 + 2 * Math.floor(Math.random() * Math.max(1, (h - 3) / 2));
      const gap = x0 + Math.floor(Math.random() * Math.max(1, w));
      for (let x = x0; x <= x1; x++) if (x !== gap) add(x, wy);
      divide(x0, y0, x1, wy - 1, depth + 1); divide(x0, wy + 1, x1, y1, depth + 1);
    }
  };
  divide(1, 1, cols - 2, rows - 2, 0);
  return walls;
}
