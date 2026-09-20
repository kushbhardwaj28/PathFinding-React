import type { Frame } from '../types';

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
