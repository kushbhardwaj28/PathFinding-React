/**
 * Shared types for the step engine. See algorithms/index.ts for the overview
 * of how a "frame" (this file's `Frame`) flows from a builder to a renderer.
 */

export type VizKind = 'grid' | 'bars' | 'graph' | 'tree' | 'matrix' | 'seq' | 'hash';
export type FamilyId = 'path' | 'sort' | 'graph' | 'tree' | 'dp' | 'ds';

export interface Family {
  id: FamilyId;
  name: string;
  note: string;
}

export interface AlgoMeta {
  name: string;
  family: FamilyId;
  viz: VizKind;
  big: string;
  /** steps per second during playback */
  rate: number;
  tagline: string;
  idea: string;
  use: string;
  pitfall: string;
  cost: [string, string][];
  code: string[];
}

/** Shared, editable input for every family. */
export interface Inputs {
  cols: number;
  rows: number;
  walls: Set<number>;
  start: number;
  goal: number;
  arr: number[];
}

/** Renderer-specific snapshot. Fields are read only by the matching renderer. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Frame = Record<string, any> & { cap: string };
