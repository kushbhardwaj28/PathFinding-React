import type { Frame } from '../types';
import { createSeqWorld, type SeqEntry } from './sequence-world';

export function stackFrames(): Frame[] {
  const { frames, snap } = createSeqWorld('stack');
  const s: SeqEntry[] = [];
  snap(s, 'empty stack', 'top → —');
  [5, 9, 2].forEach(value => { s.push({ value, state: 1 }); snap(s, 'push(' + value + ')', 'top → ' + value); s[s.length - 1].state = 0; });
  const popped = s[s.length - 1].value;
  s[s.length - 1].state = 4; snap(s, 'pop() → ' + popped, 'top → ' + popped);
  s.pop(); snap(s, 'popped', 'top → ' + s[s.length - 1].value);
  s[s.length - 1].state = 2; snap(s, 'peek() → ' + s[s.length - 1].value + ' (no mutation)', 'top → ' + s[s.length - 1].value);
  s[s.length - 1].state = 0;
  s.push({ value: 7, state: 1 }); snap(s, 'push(7)', 'top → 7');
  return frames;
}
