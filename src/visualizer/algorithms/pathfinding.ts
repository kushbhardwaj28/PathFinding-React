import type { Frame, Inputs } from './types';

/**
 * Shared grid setup for dijkstra/astar/bfs/dfs: the wall mask, snapshot
 * helper, neighbor lookup and path reconstruction. Deliberately does NOT
 * include the frontier data structure or the enqueue/relax gate — those
 * differ per algorithm (bfs gates on first-seen, dfs has no enqueue gate,
 * dijkstra/astar gate on relaxation with a sorted [priority, node] queue)
 * and stay local to each function below.
 */
function createGridWorld(inputs: Inputs) {
  const { cols, rows, walls, start, goal } = inputs;
  const n = cols * rows;
  const base = new Uint8Array(n);
  walls.forEach(i => { base[i] = 1; });
  const cells = Uint8Array.from(base);
  const frames: Frame[] = [];
  const snap = (cap: string) => frames.push({ cells: Uint8Array.from(cells), cap });
  const columnOf = (i: number) => i % cols;
  const rowOf = (i: number) => Math.floor(i / cols);
  const manhattanToGoal = (i: number) => Math.abs(columnOf(i) - columnOf(goal)) + Math.abs(rowOf(i) - rowOf(goal));
  const neighborsOf = (i: number) => {
    const col = columnOf(i), row = rowOf(i);
    const result: number[] = [];
    if (row > 0) result.push(i - cols);
    if (col < cols - 1) result.push(i + 1);
    if (row < rows - 1) result.push(i + cols);
    if (col > 0) result.push(i - 1);
    return result.filter(m => !walls.has(m));
  };
  const tracePathAndFinish = (prev: Map<number, number>, found: boolean): Frame[] => {
    if (found) {
      let cur = prev.get(goal), pathLength = 1;
      const chain: number[] = [];
      while (cur !== undefined && cur !== start) { chain.push(cur); cur = prev.get(cur); }
      chain.reverse();
      for (const c of chain) { cells[c] = 4; pathLength++; snap('path length ' + pathLength); }
      snap('path length ' + (pathLength + 1));
    } else {
      snap('goal unreachable');
    }
    return frames;
  };
  return { n, cells, frames, snap, start, goal, neighborsOf, manhattanToGoal, tracePathAndFinish };
}

export function bfsFrames(inputs: Inputs): Frame[] {
  const { n, cells, snap, start, goal, neighborsOf, tracePathAndFinish } = createGridWorld(inputs);
  const prev = new Map<number, number>();
  const dist = new Map<number, number>([[start, 0]]);
  const seen = new Set<number>();
  const queue: number[] = [start];
  let found = false, guard = n * 6;
  snap('frontier 1');
  while (queue.length && guard-- > 0) {
    const node = queue.shift()!;
    if (seen.has(node)) continue;
    seen.add(node);
    if (node !== start && node !== goal) cells[node] = 3;
    if (node === goal) { found = true; snap('goal reached'); break; }
    for (const neighbor of neighborsOf(node)) {
      if (seen.has(neighbor)) continue;
      const newDistance = (dist.get(node) ?? 0) + 1;
      if (dist.has(neighbor)) continue;
      dist.set(neighbor, newDistance); prev.set(neighbor, node); queue.push(neighbor);
      if (neighbor !== goal && cells[neighbor] !== 3) cells[neighbor] = 2;
    }
    snap('settled ' + seen.size + ' · frontier ' + queue.length);
  }
  return tracePathAndFinish(prev, found);
}

export function dfsFrames(inputs: Inputs): Frame[] {
  const { n, cells, snap, start, goal, neighborsOf, tracePathAndFinish } = createGridWorld(inputs);
  const prev = new Map<number, number>();
  const dist = new Map<number, number>([[start, 0]]);
  const seen = new Set<number>();
  const stack: number[] = [start];
  let found = false, guard = n * 6;
  snap('frontier 1');
  while (stack.length && guard-- > 0) {
    const node = stack.pop()!;
    if (seen.has(node)) continue;
    seen.add(node);
    if (node !== start && node !== goal) cells[node] = 3;
    if (node === goal) { found = true; snap('goal reached'); break; }
    for (const neighbor of neighborsOf(node)) {
      if (seen.has(neighbor)) continue;
      const newDistance = (dist.get(node) ?? 0) + 1;
      prev.set(neighbor, node); dist.set(neighbor, newDistance); stack.push(neighbor);
      if (neighbor !== goal && cells[neighbor] !== 3) cells[neighbor] = 2;
    }
    snap('settled ' + seen.size + ' · frontier ' + stack.length);
  }
  return tracePathAndFinish(prev, found);
}

export function dijkstraFrames(inputs: Inputs): Frame[] {
  const { n, cells, snap, start, goal, neighborsOf, tracePathAndFinish } = createGridWorld(inputs);
  const prev = new Map<number, number>();
  const dist = new Map<number, number>([[start, 0]]);
  const seen = new Set<number>();
  const open: [number, number][] = [[0, start]];
  const enqueue = (node: number, priority: number) => { open.push([priority, node]); open.sort((a, b) => a[0] - b[0]); };
  let found = false, guard = n * 6;
  snap('frontier 1');
  while (open.length && guard-- > 0) {
    const node = open.shift()![1];
    if (seen.has(node)) continue;
    seen.add(node);
    if (node !== start && node !== goal) cells[node] = 3;
    if (node === goal) { found = true; snap('goal reached'); break; }
    for (const neighbor of neighborsOf(node)) {
      if (seen.has(neighbor)) continue;
      const newDistance = (dist.get(node) ?? 0) + 1;
      if (newDistance < (dist.get(neighbor) ?? Infinity)) {
        dist.set(neighbor, newDistance); prev.set(neighbor, node);
        enqueue(neighbor, newDistance);
      } else continue;
      if (neighbor !== goal && cells[neighbor] !== 3) cells[neighbor] = 2;
    }
    snap('settled ' + seen.size + ' · frontier ' + open.length);
  }
  return tracePathAndFinish(prev, found);
}

export function astarFrames(inputs: Inputs): Frame[] {
  const { n, cells, snap, start, goal, neighborsOf, manhattanToGoal, tracePathAndFinish } = createGridWorld(inputs);
  const prev = new Map<number, number>();
  const dist = new Map<number, number>([[start, 0]]);
  const seen = new Set<number>();
  const open: [number, number][] = [[manhattanToGoal(start), start]];
  const enqueue = (node: number, priority: number) => { open.push([priority, node]); open.sort((a, b) => a[0] - b[0]); };
  let found = false, guard = n * 6;
  snap('frontier 1');
  while (open.length && guard-- > 0) {
    const node = open.shift()![1];
    if (seen.has(node)) continue;
    seen.add(node);
    if (node !== start && node !== goal) cells[node] = 3;
    if (node === goal) { found = true; snap('goal reached'); break; }
    for (const neighbor of neighborsOf(node)) {
      if (seen.has(neighbor)) continue;
      const newDistance = (dist.get(node) ?? 0) + 1;
      if (newDistance < (dist.get(neighbor) ?? Infinity)) {
        dist.set(neighbor, newDistance); prev.set(neighbor, node);
        enqueue(neighbor, newDistance + manhattanToGoal(neighbor));
      } else continue;
      if (neighbor !== goal && cells[neighbor] !== 3) cells[neighbor] = 2;
    }
    snap('settled ' + seen.size + ' · frontier ' + open.length);
  }
  return tracePathAndFinish(prev, found);
}
