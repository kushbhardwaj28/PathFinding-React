import type { Frame } from '../types';
import { createSeqWorld, type SeqEntry } from './sequence-world';

export function queueFrames(): Frame[] {
  const { frames, snap } = createSeqWorld('queue');
  const q: SeqEntry[] = [];
  snap(q, 'empty queue', 'head → — · tail → —');
  [3, 8, 1, 6].forEach(value => { q.push({ value, state: 1 }); snap(q, 'enqueue(' + value + ')', 'head → ' + q[0].value + ' · tail → ' + value); q[q.length - 1].state = 0; });
  for (let step = 0; step < 2; step++) {
    q[0].state = 4; snap(q, 'dequeue() → ' + q[0].value, 'head → ' + q[0].value);
    q.shift(); snap(q, 'head advances (O(1) with a pointer)', 'head → ' + q[0].value + ' · tail → ' + q[q.length - 1].value);
  }
  return frames;
}
