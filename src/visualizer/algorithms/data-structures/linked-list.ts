import type { Frame } from '../types';
import { createSeqWorld, type SeqEntry } from './sequence-world';

export function linkedListFrames(): Frame[] {
  const { frames, snap } = createSeqWorld('linked');
  const list: SeqEntry[] = [{ value: 12, state: 0 }, { value: 37, state: 0 }, { value: 5, state: 0 }];
  snap(list, 'head → 12 → 37 → 5 → null', 'length 3');
  list[0].state = 2; snap(list, 'traverse: at 12', 'hops 1');
  list[0].state = 0; list[1].state = 2; snap(list, 'traverse: at 37 — the predecessor', 'hops 2');
  list.splice(2, 0, { value: 21, state: 1 }); snap(list, 'insertAfter(37, 21) — two pointer writes', 'length 4');
  list[2].state = 0; list[1].state = 0;
  list[3].state = 4; snap(list, 'removeAfter(21) marks 5 for removal', 'length 4');
  list.splice(3, 1); snap(list, 'node unlinked — nothing shifted', 'length 3');
  return frames;
}
