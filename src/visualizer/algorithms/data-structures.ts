import type { Frame } from './types';

interface SeqEntry {
  value: number;
  state: number;
}

function createSeqWorld(mode: 'stack' | 'queue' | 'linked') {
  const frames: Frame[] = [];
  const snap = (items: SeqEntry[], cap: string, ptr: string) => frames.push({ items: items.map(x => ({ ...x })), cap, ptr, mode });
  return { frames, snap };
}

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

interface HashEntry {
  key: string;
  state: number;
}

export function hashTableFrames(): Frame[] {
  const BUCKET_COUNT = 8;
  const buckets: HashEntry[][] = Array.from({ length: BUCKET_COUNT }, () => []);
  const frames: Frame[] = [];
  const bucketIndexOf = (key: string) => {
    let hash = 2166136261;
    for (const ch of key) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
    return (hash >>> 0) % BUCKET_COUNT;
  };
  const snap = (cap: string, probe: number) => frames.push({ buckets: buckets.map(b => b.map(e => ({ ...e }))), cap, probe });
  snap('8 empty buckets, load factor 0', -1);
  ['red', 'green', 'blue', 'cyan', 'plum', 'gold'].forEach((key, n) => {
    const i = bucketIndexOf(key);
    buckets[i].push({ key, state: 1 });
    snap('set("' + key + '") → hash % 8 = ' + i + (buckets[i].length > 1 ? ' · collision, chained' : ''), i);
    buckets[i][buckets[i].length - 1].state = 0;
    if (n === 5) snap('load factor ' + ((n + 1) / BUCKET_COUNT).toFixed(2) + ' — resize at 0.75', -1);
  });
  const probe = bucketIndexOf('blue');
  buckets[probe].forEach((entry, n) => {
    buckets[probe].forEach(x => { x.state = 0; });
    entry.state = entry.key === 'blue' ? 3 : 2;
    snap(entry.key === 'blue' ? 'get("blue") → hit after ' + (n + 1) + ' chain step(s)' : 'walk chain: "' + entry.key + '" ≠ "blue"', probe);
  });
  return frames;
}
