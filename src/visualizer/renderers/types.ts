export type Ctx = CanvasRenderingContext2D;

export interface RenderOpts {
  cols?: number;
  rows?: number;
  start?: number | null;
  goal?: number | null;
  square?: boolean;
  /** written back by the grid renderer so the board can hit-test clicks */
  geom?: { cell: number; ox: number; oy: number };
}
