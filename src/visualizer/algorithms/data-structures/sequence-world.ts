import type { Frame } from '../types';

export interface SeqEntry {
  value: number;
  state: number;
}

export function createSeqWorld(mode: 'stack' | 'queue' | 'linked') {
  const frames: Frame[] = [];
  const snap = (items: SeqEntry[], cap: string, ptr: string) => frames.push({ items: items.map(x => ({ ...x })), cap, ptr, mode });
  return { frames, snap };
}
