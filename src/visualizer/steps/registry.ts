/**
 * Step engine: algorithm metadata, reference code snippets, prose notes,
 * and frame builders. A "frame" is a complete snapshot the renderer can draw
 * with no knowledge of history, which is what makes step-back free.
 *
 * Adding an algorithm = one entry in ALGOS + one builder function + one line
 * in ALGORITHM_BUILDERS. Forgetting the builder is a compile error, since
 * AlgoKey is derived from ALGOS's own keys.
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


export const FAMILIES: Family[] = [
  { id: 'path', name: 'Pathfinding', note: 'Shortest routes on a 4-neighbour grid.' },
  { id: 'sort', name: 'Sorting', note: 'Comparison sorts over a random array.' },
  { id: 'graph', name: 'Graph', note: 'Spanning trees, ordering, cycles.' },
  { id: 'tree', name: 'Trees', note: 'BST operations and heap ordering.' },
  { id: 'dp', name: 'Dynamic programming', note: 'Tables filled bottom-up.' },
  { id: 'ds', name: 'Data structures', note: 'Operation-by-operation state.' }
];

const GRAPH = {
  nodes: [
    { label: 'A', x: 0.07, y: 0.50 }, { label: 'B', x: 0.28, y: 0.17 }, { label: 'C', x: 0.28, y: 0.83 },
    { label: 'D', x: 0.50, y: 0.50 }, { label: 'E', x: 0.72, y: 0.15 }, { label: 'F', x: 0.72, y: 0.85 },
    { label: 'G', x: 0.93, y: 0.50 }, { label: 'H', x: 0.50, y: 0.07 }
  ],
  edges: [[0, 1, 4], [0, 2, 3], [1, 3, 2], [1, 7, 6], [2, 3, 5], [2, 5, 7], [3, 4, 3], [3, 5, 4], [4, 6, 2], [5, 6, 5], [4, 7, 1], [1, 2, 8]]
};

const DIGRAPH = {
  nodes: [
    { label: 'A', x: 0.08, y: 0.50 }, { label: 'B', x: 0.30, y: 0.22 }, { label: 'C', x: 0.30, y: 0.78 },
    { label: 'D', x: 0.52, y: 0.50 }, { label: 'E', x: 0.74, y: 0.22 }, { label: 'F', x: 0.74, y: 0.78 },
    { label: 'G', x: 0.94, y: 0.50 }
  ],
  edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [1, 5]]
};

const BST_SEQ = [50, 30, 70, 20, 40, 60, 80, 35];

export const ALGOS = {
  /* ---------------- Pathfinding ---------------- */
  dijkstra: {
    name: "Dijkstra's algorithm", family: 'path', viz: 'grid', big: 'O(E log V)', rate: 70,
    tagline: 'Settles cells in order of distance from the start. First arrival is cheapest arrival.',
    idea: 'A min-priority queue keyed on distance. Popping the closest unsettled cell makes its distance final — no later route can beat it.',
    use: 'Weighted graphs with non-negative edges: routing, network latency, cost maps.',
    pitfall: 'Negative weights break the settle-once invariant; on a uniform grid it degenerates to BFS, which is why the visited region is a disc.',
    cost: [['Time', 'O(E log V)'], ['Space', 'O(V)'], ['Optimal', 'Yes'], ['Heuristic', 'None']],
    code: ['function dijkstra(grid, start, goal) {', '  const dist = new Map([[start, 0]]);', '  const prev = new Map();', '  const pq = new MinHeap([[0, start]]);', '  while (!pq.isEmpty()) {', '    const [d, node] = pq.pop();', '    if (settled.has(node)) continue;', '    settled.add(node);', '    if (node === goal) break;', '    for (const nb of neighbors(grid, node)) {', '      const nd = d + weight(node, nb);', '      if (nd < (dist.get(nb) ?? Infinity)) {', '        dist.set(nb, nd);', '        prev.set(nb, node);', '        pq.push([nd, nb]);', '      }', '    }', '  }', '  return reconstruct(prev, goal);', '}']
  },
  astar: {
    name: 'A* search', family: 'path', viz: 'grid', big: 'O(E log V)', rate: 70,
    tagline: 'Dijkstra ordered by cost-so-far plus an estimate of cost-to-go.',
    idea: 'Rank the open set by f = g + h. An admissible h never overestimates, so optimality survives while the search leans toward the goal.',
    use: 'Grids and game maps where a cheap distance estimate exists.',
    pitfall: 'Manhattan distance is inadmissible once diagonal moves are allowed — switch to octile, or A* stops being optimal.',
    cost: [['Time', 'O(E log V)'], ['Space', 'O(V)'], ['Optimal', 'If h admissible'], ['Heuristic', 'Manhattan']],
    code: ['function astar(grid, start, goal) {', '  const g = new Map([[start, 0]]);', '  const open = new MinHeap([[h(start, goal), start]]);', '  const prev = new Map();', '  while (!open.isEmpty()) {', '    const [, node] = open.pop();', '    if (node === goal) break;', '    closed.add(node);', '    for (const nb of neighbors(grid, node)) {', '      const tentative = g.get(node) + 1;', '      if (tentative < (g.get(nb) ?? Infinity)) {', '        g.set(nb, tentative);', '        prev.set(nb, node);', '        open.push([tentative + h(nb, goal), nb]);', '      }', '    }', '  }', '  return reconstruct(prev, goal);', '}']
  },
  bfs: {
    name: 'Breadth-first search', family: 'path', viz: 'grid', big: 'O(V + E)', rate: 70,
    tagline: 'A FIFO queue sweeps the grid in rings of equal step count.',
    idea: 'Visit all cells at distance k before any at k+1. On unweighted graphs that ordering alone yields shortest paths.',
    use: 'Unweighted shortest path, connected components, level-order work.',
    pitfall: 'Mark cells seen on enqueue, not on dequeue, or duplicates flood the queue.',
    cost: [['Time', 'O(V + E)'], ['Space', 'O(V)'], ['Optimal', 'Unweighted only'], ['Heuristic', 'None']],
    code: ['function bfs(grid, start, goal) {', '  const queue = [start];', '  const prev = new Map();', '  const seen = new Set([start]);', '  while (queue.length) {', '    const node = queue.shift();', '    if (node === goal) break;', '    for (const nb of neighbors(grid, node)) {', '      if (seen.has(nb)) continue;', '      seen.add(nb);', '      prev.set(nb, node);', '      queue.push(nb);', '    }', '  }', '  return reconstruct(prev, goal);', '}']
  },
  dfs: {
    name: 'Depth-first search', family: 'path', viz: 'grid', big: 'O(V + E)', rate: 70,
    tagline: 'A LIFO stack commits to one corridor until it dead-ends.',
    idea: 'Same skeleton as BFS with a stack instead of a queue. Reaches somewhere fast; says nothing about how far.',
    use: 'Reachability, cycle detection, topological order, maze carving.',
    pitfall: 'Not a shortest-path algorithm — the route it returns is usually far from minimal.',
    cost: [['Time', 'O(V + E)'], ['Space', 'O(V)'], ['Optimal', 'No'], ['Heuristic', 'None']],
    code: ['function dfs(grid, start, goal) {', '  const stack = [start];', '  const prev = new Map();', '  const seen = new Set();', '  while (stack.length) {', '    const node = stack.pop();', '    if (seen.has(node)) continue;', '    seen.add(node);', '    if (node === goal) break;', '    for (const nb of neighbors(grid, node)) {', '      if (seen.has(nb)) continue;', '      prev.set(nb, node);', '      stack.push(nb);', '    }', '  }', '  return reconstruct(prev, goal);', '}']
  },

  /* ---------------- Sorting ---------------- */
  bubble: {
    name: 'Bubble sort', family: 'sort', viz: 'bars', big: 'O(n²)', rate: 34,
    tagline: 'Adjacent swaps carry the largest remaining value to the end of each pass.',
    idea: 'After pass k the last k slots are final. An early-exit flag stops the moment a pass makes no swaps.',
    use: 'Teaching, and nearly sorted input where the flag makes it one O(n) pass.',
    pitfall: 'Quadratic swap count — the most write-heavy of the simple sorts.',
    cost: [['Best', 'O(n)'], ['Average', 'O(n²)'], ['Space', 'O(1)'], ['Stable', 'Yes']],
    code: ['function bubbleSort(a) {', '  for (let end = a.length - 1; end > 0; end--) {', '    let swapped = false;', '    for (let i = 0; i < end; i++) {', '      if (a[i] > a[i + 1]) {', '        [a[i], a[i + 1]] = [a[i + 1], a[i]];', '        swapped = true;', '      }', '    }', '    if (!swapped) break;', '  }', '  return a;', '}']
  },
  insertion: {
    name: 'Insertion sort', family: 'sort', viz: 'bars', big: 'O(n²)', rate: 34,
    tagline: 'Grow a sorted prefix, sliding each new value back into place.',
    idea: 'Hold a[i] aside, shift every larger element one slot right, drop the key into the gap.',
    use: 'Small arrays and the base case of production hybrids (n ≲ 16).',
    pitfall: 'Shifts, not swaps — cheap on nearly sorted data, quadratic on random data.',
    cost: [['Best', 'O(n)'], ['Average', 'O(n²)'], ['Space', 'O(1)'], ['Stable', 'Yes']],
    code: ['function insertionSort(a) {', '  for (let i = 1; i < a.length; i++) {', '    const key = a[i];', '    let j = i - 1;', '    while (j >= 0 && a[j] > key) {', '      a[j + 1] = a[j];', '      j--;', '    }', '    a[j + 1] = key;', '  }', '  return a;', '}']
  },
  merge: {
    name: 'Merge sort', family: 'sort', viz: 'bars', big: 'O(n log n)', rate: 34,
    tagline: 'Sort halves recursively, then merge two sorted runs in linear time.',
    idea: 'Linear work per level, log n levels, no dependence on input order.',
    use: 'Stable sorting, linked lists, external sorts over data that does not fit in memory.',
    pitfall: 'O(n) scratch space and real copy cost — in-place quicksort usually wins on primitives.',
    cost: [['Best', 'O(n log n)'], ['Worst', 'O(n log n)'], ['Space', 'O(n)'], ['Stable', 'Yes']],
    code: ['function mergeSort(a, lo = 0, hi = a.length - 1) {', '  if (lo >= hi) return a;', '  const mid = (lo + hi) >> 1;', '  mergeSort(a, lo, mid);', '  mergeSort(a, mid + 1, hi);', '  merge(a, lo, mid, hi);', '  return a;', '}', '', 'function merge(a, lo, mid, hi) {', '  const left = a.slice(lo, mid + 1);', '  const right = a.slice(mid + 1, hi + 1);', '  let i = 0, j = 0, k = lo;', '  while (i < left.length && j < right.length)', '    a[k++] = left[i] <= right[j] ? left[i++] : right[j++];', '  while (i < left.length) a[k++] = left[i++];', '  while (j < right.length) a[k++] = right[j++];', '}']
  },
  quick: {
    name: 'Quicksort', family: 'sort', viz: 'bars', big: 'O(n log n)', rate: 34,
    tagline: 'Partition around a pivot; the pivot lands in its final slot.',
    idea: 'Sweep the range moving smaller values left, then swap the pivot into the boundary. Two independent subproblems remain.',
    use: 'General in-memory sorting — the default in most standard libraries.',
    pitfall: 'Sorted input with a last-element pivot degrades to O(n²). Randomise or use median-of-three.',
    cost: [['Best', 'O(n log n)'], ['Worst', 'O(n²)'], ['Space', 'O(log n)'], ['Stable', 'No']],
    code: ['function quickSort(a, lo = 0, hi = a.length - 1) {', '  if (lo >= hi) return a;', '  const p = partition(a, lo, hi);', '  quickSort(a, lo, p - 1);', '  quickSort(a, p + 1, hi);', '  return a;', '}', '', 'function partition(a, lo, hi) {', '  const pivot = a[hi];', '  let i = lo;', '  for (let j = lo; j < hi; j++) {', '    if (a[j] < pivot) {', '      [a[i], a[j]] = [a[j], a[i]];', '      i++;', '    }', '  }', '  [a[i], a[hi]] = [a[hi], a[i]];', '  return i;', '}']
  },
  heapsort: {
    name: 'Heap sort', family: 'sort', viz: 'bars', big: 'O(n log n)', rate: 34,
    tagline: 'Build a max-heap in place, then repeatedly swap the root to the back.',
    idea: 'The array doubles as a binary heap. Extracting the max n times sorts it with no extra memory.',
    use: 'Worst-case guarantees without allocation; priority queues share the machinery.',
    pitfall: 'Poor cache locality and unstable — usually loses to quicksort in wall-clock time.',
    cost: [['Best', 'O(n log n)'], ['Worst', 'O(n log n)'], ['Space', 'O(1)'], ['Stable', 'No']],
    code: ['function heapSort(a) {', '  const n = a.length;', '  for (let i = (n >> 1) - 1; i >= 0; i--) sift(a, i, n);', '  for (let end = n - 1; end > 0; end--) {', '    [a[0], a[end]] = [a[end], a[0]];', '    sift(a, 0, end);', '  }', '  return a;', '}', '', 'function sift(a, i, n) {', '  while (true) {', '    let big = i, l = 2 * i + 1, r = l + 1;', '    if (l < n && a[l] > a[big]) big = l;', '    if (r < n && a[r] > a[big]) big = r;', '    if (big === i) return;', '    [a[i], a[big]] = [a[big], a[i]];', '    i = big;', '  }', '}']
  },

  /* ---------------- Graph ---------------- */
  prim: {
    name: "Prim's MST", family: 'graph', viz: 'graph', big: 'O(E log V)', rate: 2.2,
    tagline: 'Grow one tree, always taking the cheapest edge leaving it.',
    idea: 'The cut property: the lightest edge across any cut separating the tree from the rest is safe to add.',
    use: 'Dense graphs, clustering, network layout where one connected tree must grow.',
    pitfall: 'Needs a connected graph; on a forest it only spans the component it started in.',
    cost: [['Time', 'O(E log V)'], ['Space', 'O(V)'], ['Structure', 'Min-heap'], ['Greedy', 'Cut property']],
    code: ['function prim(graph, root = 0) {', '  const inTree = new Set([root]);', '  const mst = [];', '  const pq = new MinHeap(graph.edgesFrom(root));', '  while (mst.length < graph.n - 1) {', '    const e = pq.pop();', '    if (inTree.has(e.a) && inTree.has(e.b)) continue;', '    const next = inTree.has(e.a) ? e.b : e.a;', '    inTree.add(next);', '    mst.push(e);', '    for (const f of graph.edgesFrom(next)) pq.push(f);', '  }', '  return mst;', '}']
  },
  kruskal: {
    name: "Kruskal's MST", family: 'graph', viz: 'graph', big: 'O(E log E)', rate: 2.2,
    tagline: 'Sort every edge by weight and keep the ones that do not close a cycle.',
    idea: 'Union-find answers "same component?" in near-constant time, so acceptance is a single check per edge.',
    use: 'Sparse graphs, and minimum spanning forests over disconnected input.',
    pitfall: 'Without union by rank and path compression the find calls dominate the runtime.',
    cost: [['Time', 'O(E log E)'], ['Space', 'O(V)'], ['Structure', 'Union-find'], ['Greedy', 'Cycle property']],
    code: ['function kruskal(graph) {', '  const dsu = new DisjointSet(graph.n);', '  const mst = [];', '  for (const e of [...graph.edges].sort((x, y) => x.w - y.w)) {', '    if (dsu.find(e.a) === dsu.find(e.b)) continue;', '    dsu.union(e.a, e.b);', '    mst.push(e);', '    if (mst.length === graph.n - 1) break;', '  }', '  return mst;', '}']
  },
  topo: {
    name: 'Topological sort', family: 'graph', viz: 'graph', big: 'O(V + E)', rate: 2.2,
    tagline: "Kahn's algorithm: repeatedly emit a node with no remaining dependencies.",
    idea: 'Track in-degrees. A node becomes ready when its last incoming edge is consumed.',
    use: 'Build systems, task scheduling, module resolution, spreadsheet recalculation.',
    pitfall: 'If the queue empties before all nodes are emitted, the graph has a cycle — no valid order exists.',
    cost: [['Time', 'O(V + E)'], ['Space', 'O(V)'], ['Structure', 'Queue'], ['Needs', 'DAG']],
    code: ['function topoSort(graph) {', '  const deg = graph.inDegrees();', '  const ready = graph.nodes.filter(n => deg[n] === 0);', '  const order = [];', '  while (ready.length) {', '    const n = ready.shift();', '    order.push(n);', '    for (const m of graph.out(n)) {', '      if (--deg[m] === 0) ready.push(m);', '    }', '  }', '  if (order.length !== graph.n) throw new Error("cycle");', '  return order;', '}']
  },
  cycle: {
    name: 'Cycle detection', family: 'graph', viz: 'graph', big: 'O(V + E)', rate: 2.2,
    tagline: 'DFS with three colours: a grey-to-grey edge is a back edge.',
    idea: 'White unvisited, grey on the recursion stack, black finished. Reaching grey means the path looped.',
    use: 'Dependency validation, deadlock detection, proving a graph is a DAG.',
    pitfall: 'On undirected graphs the parent edge is not a cycle — skip it, or every edge reports one.',
    cost: [['Time', 'O(V + E)'], ['Space', 'O(V)'], ['Structure', 'Recursion'], ['Returns', 'Back edge']],
    code: ['const WHITE = 0, GREY = 1, BLACK = 2;', '', 'function hasCycle(graph) {', '  const color = new Array(graph.n).fill(WHITE);', '  const visit = (n: number): boolean => {', '    color[n] = GREY;', '    for (const m of graph.out(n)) {', '      if (color[m] === GREY) return true;', '      if (color[m] === WHITE && visit(m)) return true;', '    }', '    color[n] = BLACK;', '    return false;', '  };', '  return graph.nodes.some(n => color[n] === WHITE && visit(n));', '}']
  },

  /* ---------------- Trees ---------------- */
  bstInsert: {
    name: 'BST insert', family: 'tree', viz: 'tree', big: 'O(h)', rate: 1.6,
    tagline: 'Walk left or right by comparison until a null child appears.',
    idea: 'Every insertion follows a single root-to-leaf path, so cost is the height, not the size.',
    use: 'Ordered maps and sets when the key order is not adversarial.',
    pitfall: 'Sorted insertion order builds a linked list — h becomes n. Balance it (AVL, red-black) for guarantees.',
    cost: [['Balanced', 'O(log n)'], ['Degenerate', 'O(n)'], ['Space', 'O(1) iterative'], ['Ordered', 'Yes']],
    code: ['function insert(root, value) {', '  if (!root) return new Node(value);', '  let node = root;', '  while (true) {', '    if (value < node.value) {', '      if (!node.left) { node.left = new Node(value); return root; }', '      node = node.left;', '    } else {', '      if (!node.right) { node.right = new Node(value); return root; }', '      node = node.right;', '    }', '  }', '}']
  },
  bstSearch: {
    name: 'BST search', family: 'tree', viz: 'tree', big: 'O(h)', rate: 1.2,
    tagline: 'Each comparison discards one subtree.',
    idea: 'Binary search over a linked structure: h comparisons, no arithmetic on indices.',
    use: 'Lookup in ordered maps, predecessor and successor queries, range scans.',
    pitfall: 'Comparisons must match the insertion ordering exactly, or the discarded subtree may hold the key.',
    cost: [['Balanced', 'O(log n)'], ['Degenerate', 'O(n)'], ['Space', 'O(1)'], ['Ordered', 'Yes']],
    code: ['function search(root, target) {', '  let node = root;', '  while (node) {', '    if (target === node.value) return node;', '    node = target < node.value ? node.left : node.right;', '  }', '  return null;', '}']
  },
  inorder: {
    name: 'In-order traversal', family: 'tree', viz: 'tree', big: 'O(n)', rate: 1.6,
    tagline: 'Left subtree, node, right subtree — emits a BST in sorted order.',
    idea: 'The recursion order is the sort order. Pre-order serialises shape; post-order frees children first.',
    use: 'Sorted iteration, BST validation, expression-tree evaluation.',
    pitfall: 'Recursion depth equals tree height — an unbalanced tree can overflow the stack; iterate with an explicit stack.',
    cost: [['Time', 'O(n)'], ['Space', 'O(h)'], ['Order', 'Sorted'], ['Variants', 'pre / post']],
    code: ['function inorder(node, out = []) {', '  if (!node) return out;', '  inorder(node.left, out);', '  out.push(node.value);', '  inorder(node.right, out);', '  return out;', '}', '', '// iterative form', 'function inorderIter(root) {', '  const out = [], stack = [];', '  let node = root;', '  while (node || stack.length) {', '    while (node) { stack.push(node); node = node.left; }', '    node = stack.pop();', '    out.push(node.value);', '    node = node.right;', '  }', '  return out;', '}']
  },
  heapInsert: {
    name: 'Heap insert (sift-up)', family: 'tree', viz: 'tree', big: 'O(log n)', rate: 1.4,
    tagline: 'Append at the end, then swap upward while the parent is larger.',
    idea: 'A min-heap only guarantees parent ≤ children. Repairing one path is enough after an append.',
    use: 'Priority queues behind Dijkstra, A*, schedulers and event loops.',
    pitfall: 'A heap is not sorted — only the root is meaningful. Iterating the backing array gives no order.',
    cost: [['Insert', 'O(log n)'], ['Peek min', 'O(1)'], ['Space', 'O(1)'], ['Backing', 'Array']],
    code: ['function push(heap, value) {', '  heap.push(value);', '  let i = heap.length - 1;', '  while (i > 0) {', '    const parent = (i - 1) >> 1;', '    if (heap[parent] <= heap[i]) break;', '    [heap[parent], heap[i]] = [heap[i], heap[parent]];', '    i = parent;', '  }', '  return heap;', '}']
  },

  /* ---------------- Dynamic programming ---------------- */
  lcs: {
    name: 'Longest common subsequence', family: 'dp', viz: 'matrix', big: 'O(nm)', rate: 9,
    tagline: 'Each cell asks: do these two characters match?',
    idea: 'Match extends the diagonal by one; mismatch inherits the better neighbour. The table is monotone, so the answer sits in the corner.',
    use: 'Diffs, version control, sequence alignment in bioinformatics.',
    pitfall: 'The table gives the length; recovering the subsequence itself needs a backtrack from the corner.',
    cost: [['Time', 'O(nm)'], ['Space', 'O(nm)'], ['Rolling space', 'O(min(n,m))'], ['Backtrack', 'O(n+m)']],
    code: ['function lcs(a, b) {', '  const dp = Array.from({ length: a.length + 1 },', '    () => new Array(b.length + 1).fill(0));', '  for (let i = 1; i <= a.length; i++) {', '    for (let j = 1; j <= b.length; j++) {', '      dp[i][j] = a[i - 1] === b[j - 1]', '        ? dp[i - 1][j - 1] + 1', '        : Math.max(dp[i - 1][j], dp[i][j - 1]);', '    }', '  }', '  return dp[a.length][b.length];', '}']
  },
  edit: {
    name: 'Edit distance', family: 'dp', viz: 'matrix', big: 'O(nm)', rate: 9,
    tagline: 'Minimum insert, delete or replace operations between two strings.',
    idea: 'Three predecessors per cell — above, left, diagonal — one for each operation. Take the cheapest and add one.',
    use: 'Spell correction, fuzzy search, DNA alignment, typo-tolerant matching.',
    pitfall: 'The first row and column must be seeded with 0..n, not zeros — those are the pure-insert baselines.',
    cost: [['Time', 'O(nm)'], ['Space', 'O(nm)'], ['Rolling space', 'O(m)'], ['Ops', 'ins / del / sub']],
    code: ['function editDistance(a, b) {', '  const dp = Array.from({ length: a.length + 1 },', '    (_, i) => [i, ...new Array(b.length).fill(0)]);', '  for (let j = 0; j <= b.length; j++) dp[0][j] = j;', '  for (let i = 1; i <= a.length; i++) {', '    for (let j = 1; j <= b.length; j++) {', '      const cost = a[i - 1] === b[j - 1] ? 0 : 1;', '      dp[i][j] = Math.min(', '        dp[i - 1][j] + 1,', '        dp[i][j - 1] + 1,', '        dp[i - 1][j - 1] + cost);', '    }', '  }', '  return dp[a.length][b.length];', '}']
  },
  knapsack: {
    name: '0/1 knapsack', family: 'dp', viz: 'matrix', big: 'O(nW)', rate: 9,
    tagline: 'For every item and every capacity: take it, or leave it.',
    idea: 'Row i, column w holds the best value using the first i items within capacity w. Taking an item consults the row above at w − weight.',
    use: 'Budget allocation, cargo loading, subset-sum style selection.',
    pitfall: 'Pseudo-polynomial: cost scales with the numeric capacity, so large W is expensive despite the small item count.',
    cost: [['Time', 'O(nW)'], ['Space', 'O(nW)'], ['Rolling space', 'O(W)'], ['Class', 'NP-hard']],
    code: ['function knapsack(items, W) {', '  const dp = Array.from({ length: items.length + 1 },', '    () => new Array(W + 1).fill(0));', '  for (let i = 1; i <= items.length; i++) {', '    const { weight, value } = items[i - 1];', '    for (let w = 0; w <= W; w++) {', '      dp[i][w] = dp[i - 1][w];', '      if (weight <= w) {', '        dp[i][w] = Math.max(dp[i][w],', '          dp[i - 1][w - weight] + value);', '      }', '    }', '  }', '  return dp[items.length][W];', '}']
  },

  /* ---------------- Data structures ---------------- */
  stack: {
    name: 'Stack', family: 'ds', viz: 'seq', big: 'O(1)', rate: 1.1,
    tagline: 'Push and pop at one end. Last in, first out.',
    idea: 'One index moves. Because both operations touch the same end, neither shifts any other element.',
    use: 'Call frames, undo history, expression parsing, iterative DFS.',
    pitfall: 'Popping an empty stack must be an explicit case — returning undefined silently hides the bug.',
    cost: [['Push', 'O(1)'], ['Pop', 'O(1)'], ['Peek', 'O(1)'], ['Space', 'O(n)']],
    code: ['class Stack {', '  #items = [];', '  push(v) { this.#items.push(v); return this; }', '  pop() {', '    if (!this.#items.length) throw new RangeError("empty");', '    return this.#items.pop();', '  }', '  peek() { return this.#items.at(-1); }', '  get size() { return this.#items.length; }', '}']
  },
  queue: {
    name: 'Queue', family: 'ds', viz: 'seq', big: 'O(1)', rate: 1.1,
    tagline: 'Enqueue at the back, dequeue from the front. First in, first out.',
    idea: 'Two indices instead of one. A ring buffer reuses the space the head leaves behind.',
    use: 'BFS frontiers, task queues, streaming buffers, rate limiting.',
    pitfall: 'Array.shift() is O(n) — a naive queue is quadratic in a hot loop. Use a head pointer or a ring buffer.',
    cost: [['Enqueue', 'O(1)'], ['Dequeue', 'O(1)'], ['Peek', 'O(1)'], ['Space', 'O(n)']],
    code: ['class Queue {', '  #items = [];', '  #head = 0;', '  enqueue(v) { this.#items.push(v); return this; }', '  dequeue() {', '    if (this.#head >= this.#items.length) throw new RangeError("empty");', '    const v = this.#items[this.#head++];', '    if (this.#head > 32 && this.#head * 2 > this.#items.length) {', '      this.#items = this.#items.slice(this.#head);', '      this.#head = 0;', '    }', '    return v;', '  }', '}']
  },
  linked: {
    name: 'Linked list', family: 'ds', viz: 'seq', big: 'O(n)', rate: 1.1,
    tagline: 'Nodes joined by references — cheap to splice, expensive to reach.',
    idea: 'Insertion is a pointer rewrite once you hold the predecessor. Finding it is the linear part.',
    use: 'LRU caches, free lists, adjacency lists, anywhere splicing beats indexing.',
    pitfall: 'No locality and a pointer per element — arrays usually beat it in practice despite better asymptotics.',
    cost: [['Insert head', 'O(1)'], ['Index', 'O(n)'], ['Splice', 'O(1) with ref'], ['Space', 'O(n)']],
    code: ['function insertAfter(node, value) {', '  node.next = { value, next: node.next };', '  return node.next;', '}', '', 'function removeAfter(node) {', '  if (!node.next) return null;', '  const removed = node.next;', '  node.next = removed.next;', '  removed.next = null;', '  return removed;', '}', '', 'function nodeAt(head, index) {', '  let node = head;', '  while (node && index-- > 0) node = node.next;', '  return node;', '}']
  },
  hash: {
    name: 'Hash table', family: 'ds', viz: 'hash', big: 'O(1) avg', rate: 1.1,
    tagline: 'Hash the key to a bucket; collisions chain inside it.',
    idea: 'Constant time holds while the load factor stays low. Chain length is what turns O(1) into O(n).',
    use: 'Maps, sets, caches, de-duplication, index lookups.',
    pitfall: 'Load factor above ~0.75 degrades everything — resize and rehash, and never mutate a key in place.',
    cost: [['Lookup avg', 'O(1)'], ['Lookup worst', 'O(n)'], ['Space', 'O(n)'], ['Load factor', '≤ 0.75']],
    code: ['class HashMap {', '  #buckets = Array.from({ length: 8 }, () => []);', '  #size = 0;', '  #index(key) {', '    let h = 2166136261;', '    for (const ch of String(key)) h = (h ^ ch.charCodeAt(0)) * 16777619;', '    return (h >>> 0) % this.#buckets.length;', '  }', '  set(key, value) {', '    const bucket = this.#buckets[this.#index(key)];', '    const hit = bucket.find(e => e.key === key);', '    if (hit) { hit.value = value; return this; }', '    bucket.push({ key, value });', '    if (++this.#size / this.#buckets.length > 0.75) this.#grow();', '    return this;', '  }', '}']
  }
} satisfies Record<string, AlgoMeta>;

export type AlgoKey = keyof typeof ALGOS;
export const ALGO_KEYS = Object.keys(ALGOS) as AlgoKey[];

/* ============ builders ============ */

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

function bfsFrames(inputs: Inputs): Frame[] {
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

function dfsFrames(inputs: Inputs): Frame[] {
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

function dijkstraFrames(inputs: Inputs): Frame[] {
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

function astarFrames(inputs: Inputs): Frame[] {
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

function createBarWorld(arr: number[]) {
  const a = arr.slice();
  const frames: Frame[] = [];
  const sorted = new Set<number>();
  const snap = (active: number[], cap: string) => frames.push({ arr: a.slice(), active: active.slice(), sorted: new Set(sorted), cap });
  const cmps = { n: 0 };
  snap([], 'unsorted, n = ' + a.length);
  return { a, frames, sorted, snap, cmps };
}

function bubbleSortFrames(inputs: Inputs): Frame[] {
  const { a, frames, sorted, snap, cmps } = createBarWorld(inputs.arr);
  for (let end = a.length - 1; end > 0; end--) {
    let swapped = false;
    for (let i = 0; i < end; i++) {
      cmps.n++; snap([i, i + 1], 'compare ' + a[i] + ' : ' + a[i + 1]);
      if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; swapped = true; snap([i, i + 1], 'swap'); }
    }
    sorted.add(end); snap([], 'index ' + end + ' final');
    if (!swapped) break;
  }
  for (let i = 0; i < a.length; i++) sorted.add(i);
  snap([], 'sorted · ' + cmps.n + ' comparisons');
  return frames;
}

function insertionSortFrames(inputs: Inputs): Frame[] {
  const { a, frames, sorted, snap, cmps } = createBarWorld(inputs.arr);
  sorted.add(0);
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    snap([i], 'key = ' + key);
    while (j >= 0 && a[j] > key) { cmps.n++; a[j + 1] = a[j]; j--; snap([j + 1, i], 'shift right'); }
    a[j + 1] = key; sorted.add(i);
    snap([j + 1], 'key placed at ' + (j + 1));
  }
  snap([], 'sorted · ' + cmps.n + ' shifts');
  return frames;
}

function mergeSortFrames(inputs: Inputs): Frame[] {
  const { a, frames, sorted, snap, cmps } = createBarWorld(inputs.arr);
  const mergeSortRange = (lo: number, hi: number): void => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    mergeSortRange(lo, mid); mergeSortRange(mid + 1, hi);
    const left = a.slice(lo, mid + 1), right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      cmps.n++;
      a[k] = left[i] <= right[j] ? left[i++] : right[j++];
      snap([k], 'merge [' + lo + '..' + hi + ']');
      k++;
    }
    while (i < left.length) { a[k] = left[i++]; snap([k], 'drain left'); k++; }
    while (j < right.length) { a[k] = right[j++]; snap([k], 'drain right'); k++; }
    for (let x = lo; x <= hi; x++) sorted.add(x);
    snap([], 'run [' + lo + '..' + hi + '] sorted');
    if (hi - lo + 1 < a.length) for (let x = lo; x <= hi; x++) sorted.delete(x);
  };
  mergeSortRange(0, a.length - 1);
  for (let i = 0; i < a.length; i++) sorted.add(i);
  snap([], 'sorted · ' + cmps.n + ' comparisons');
  return frames;
}

function quickSortFrames(inputs: Inputs): Frame[] {
  const { a, frames, sorted, snap, cmps } = createBarWorld(inputs.arr);
  const quickSortRange = (lo: number, hi: number): void => {
    if (lo > hi) return;
    if (lo === hi) { sorted.add(lo); snap([lo], 'single element final'); return; }
    const pivot = a[hi];
    let i = lo;
    snap([hi], 'pivot = ' + pivot);
    for (let j = lo; j < hi; j++) {
      cmps.n++; snap([j, hi], a[j] + ' < ' + pivot + ' ?');
      if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; snap([i, j], 'move left'); i++; }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    sorted.add(i); snap([i], 'pivot final at ' + i);
    quickSortRange(lo, i - 1); quickSortRange(i + 1, hi);
  };
  quickSortRange(0, a.length - 1);
  for (let i = 0; i < a.length; i++) sorted.add(i);
  snap([], 'sorted · ' + cmps.n + ' comparisons');
  return frames;
}

function heapSortFrames(inputs: Inputs): Frame[] {
  const { a, frames, sorted, snap, cmps } = createBarWorld(inputs.arr);
  const n = a.length;
  const sift = (i: number, len: number) => {
    while (true) {
      let big = i; const l = 2 * i + 1, r = l + 1;
      if (l < len && a[l] > a[big]) big = l;
      if (r < len && a[r] > a[big]) big = r;
      if (big === i) return;
      [a[i], a[big]] = [a[big], a[i]];
      cmps.n++; snap([i, big], 'sift down');
      i = big;
    }
  };
  for (let i = (n >> 1) - 1; i >= 0; i--) { snap([i], 'heapify from ' + i); sift(i, n); }
  snap([], 'max-heap built');
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    sorted.add(end); snap([0, end], 'root to index ' + end);
    sift(0, end);
  }
  sorted.add(0); snap([], 'sorted · ' + cmps.n + ' sift steps');
  return frames;
}

function createUndirectedGraphWorld() {
  const { nodes, edges } = GRAPH;
  const nodeStates = new Array(nodes.length).fill(0);
  const edgeStates = new Array(edges.length).fill(0);
  const frames: Frame[] = [];
  const snap = (cap: string) => frames.push({ graph: GRAPH, directed: false, ns: nodeStates.slice(), es: edgeStates.slice(), cap });
  return { nodes, edges, nodeStates, edgeStates, frames, snap };
}

function primFrames(): Frame[] {
  const { nodes, edges, nodeStates, edgeStates, frames, snap } = createUndirectedGraphWorld();
  nodeStates[0] = 2; snap('root A in tree');
  let total = 0;
  for (let step = 0; step < nodes.length - 1; step++) {
    let best = -1;
    edges.forEach(([a, b, w], i) => {
      const inA = nodeStates[a] === 2, inB = nodeStates[b] === 2;
      if (inA !== inB) { edgeStates[i] = edgeStates[i] === 3 ? 3 : 1; if (best < 0 || w < edges[best][2]) best = i; }
    });
    if (best < 0) break;
    snap('candidate edges from the tree');
    const [a, b, w] = edges[best];
    edgeStates[best] = 3; nodeStates[a] = 2; nodeStates[b] = 2; total += w;
    edges.forEach((_e, i) => { if (edgeStates[i] === 1) edgeStates[i] = 0; });
    snap('add ' + nodes[a].label + '–' + nodes[b].label + ' (w ' + w + ') · total ' + total);
  }
  snap('spanning tree weight ' + total);
  return frames;
}

function kruskalFrames(): Frame[] {
  const { nodes, edges, nodeStates, edgeStates, frames, snap } = createUndirectedGraphWorld();
  const order = edges.map((_e, i) => i).sort((x, y) => edges[x][2] - edges[y][2]);
  const parent = nodes.map((_, i) => i);
  const find = (x: number): number => parent[x] === x ? x : (parent[x] = find(parent[x]));
  let total = 0, taken = 0;
  snap('edges sorted by weight');
  for (const i of order) {
    const [a, b, w] = edges[i];
    edgeStates[i] = 1; snap('consider ' + nodes[a].label + '–' + nodes[b].label + ' (w ' + w + ')');
    if (find(a) === find(b)) { edgeStates[i] = 4; snap('rejected — closes a cycle'); continue; }
    parent[find(a)] = find(b);
    edgeStates[i] = 3; nodeStates[a] = 2; nodeStates[b] = 2; total += w; taken++;
    snap('accepted · total ' + total);
    if (taken === nodes.length - 1) break;
  }
  snap('spanning tree weight ' + total);
  return frames;
}

function createDigraphWorld(extraEdges: [number, number][] = []) {
  const graph = { nodes: DIGRAPH.nodes, edges: DIGRAPH.edges.concat(extraEdges) };
  const nodeStates = new Array(graph.nodes.length).fill(0);
  const edgeStates = new Array(graph.edges.length).fill(0);
  const frames: Frame[] = [];
  const snap = (cap: string) => frames.push({ graph, directed: true, ns: nodeStates.slice(), es: edgeStates.slice(), cap });
  return { graph, nodeStates, edgeStates, frames, snap };
}

function topoSortFrames(): Frame[] {
  const { graph, nodeStates, edgeStates, frames, snap } = createDigraphWorld();
  const deg = new Array(graph.nodes.length).fill(0);
  graph.edges.forEach(([, b]) => deg[b]++);
  const ready = deg.map((d, i) => d === 0 ? i : -1).filter(i => i >= 0);
  ready.forEach(i => { nodeStates[i] = 1; });
  snap('in-degree 0: ' + ready.map(i => graph.nodes[i].label).join(', '));
  const order: string[] = [];
  while (ready.length) {
    const n = ready.shift()!;
    nodeStates[n] = 2; order.push(graph.nodes[n].label);
    snap('emit ' + order.join(' → '));
    graph.edges.forEach(([a, b], i) => {
      if (a !== n) return;
      edgeStates[i] = 3;
      if (--deg[b] === 0) { nodeStates[b] = 1; ready.push(b); }
    });
    snap('dependencies of ' + graph.nodes[n].label + ' consumed');
  }
  snap(order.length === graph.nodes.length ? 'valid order: ' + order.join(' → ') : 'cycle — no valid order');
  return frames;
}

function cycleDetectionFrames(): Frame[] {
  const { graph, nodeStates, edgeStates, frames, snap } = createDigraphWorld([[6, 1]]);
  const color = new Array(graph.nodes.length).fill(0);
  let cycleFound = false;
  const visit = (n: number): boolean => {
    color[n] = 1; nodeStates[n] = 1; snap(graph.nodes[n].label + ' grey — on the stack');
    for (let i = 0; i < graph.edges.length; i++) {
      const [a, b] = graph.edges[i];
      if (a !== n) continue;
      edgeStates[i] = 1; snap('follow ' + graph.nodes[a].label + ' → ' + graph.nodes[b].label);
      if (color[b] === 1) { edgeStates[i] = 4; nodeStates[b] = 4; nodeStates[a] = 4; snap('back edge — cycle at ' + graph.nodes[b].label); return true; }
      if (color[b] === 0 && visit(b)) return true;
      edgeStates[i] = 3;
    }
    color[n] = 2; nodeStates[n] = 2; snap(graph.nodes[n].label + ' black — finished');
    return false;
  };
  for (let i = 0; i < graph.nodes.length && !cycleFound; i++) if (color[i] === 0) cycleFound = visit(i);
  snap(cycleFound ? 'graph contains a cycle' : 'no back edges — graph is a DAG');
  return frames;
}

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  id: number;
  state: number;
  _layoutOrder?: number;
  _layoutDepth?: number;
}

interface TreeLayoutNode {
  v: number;
  x: number;
  d: number;
  id: number;
  state: number;
}

function layoutTree(root: TreeNode | null): TreeLayoutNode[] {
  const nodes: TreeNode[] = [];
  let order = 0;
  const walk = (node: TreeNode | null, depth: number) => {
    if (!node) return;
    walk(node.left, depth + 1);
    node._layoutOrder = order++; node._layoutDepth = depth;
    nodes.push(node);
    walk(node.right, depth + 1);
  };
  walk(root, 0);
  const span = Math.max(1, order - 1);
  return nodes.map(n => ({ v: n.value, x: n._layoutOrder! / span, d: n._layoutDepth!, id: n.id, state: n.state || 0 }));
}

function treeSnapshot(root: TreeNode | null, cap: string, frames: Frame[]) {
  const nodes = layoutTree(root);
  const byId = new Map(nodes.map(n => [n.id, n]));
  const links: [TreeLayoutNode, TreeLayoutNode][] = [];
  const walk = (node: TreeNode | null) => {
    if (!node) return;
    (['left', 'right'] as const).forEach(side => {
      const child = node[side];
      if (child) { links.push([byId.get(node.id)!, byId.get(child.id)!]); walk(child); }
    });
  };
  walk(root);
  frames.push({ nodes, links, cap });
}

function createBstBuilder(frames: Frame[]) {
  let nextNodeId = 0;
  const makeTreeNode = (v: number): TreeNode => ({ value: v, left: null, right: null, id: nextNodeId++, state: 0 });
  let root: TreeNode | null = null;
  const insert = (v: number, trace: boolean) => {
    const node = makeTreeNode(v);
    if (!root) { root = node; if (trace) treeSnapshot(root, 'root = ' + v, frames); return; }
    let cur = root;
    while (true) {
      if (trace) { cur.state = 1; treeSnapshot(root, v + (v < cur.value ? ' < ' : ' ≥ ') + cur.value + ' → go ' + (v < cur.value ? 'left' : 'right'), frames); cur.state = 0; }
      const side = v < cur.value ? 'left' : 'right';
      if (!cur[side]) { cur[side] = node; node.state = trace ? 3 : 0; if (trace) treeSnapshot(root, 'insert ' + v + ' as ' + side + ' child of ' + cur.value, frames); node.state = 0; return; }
      cur = cur[side];
    }
  };
  return { insert, get root() { return root; } };
}

function bstInsertFrames(): Frame[] {
  const frames: Frame[] = [];
  const bst = createBstBuilder(frames);
  BST_SEQ.forEach(v => bst.insert(v, true));
  treeSnapshot(bst.root, 'height ' + (1 + Math.max(...layoutTree(bst.root).map(n => n.d))) + ' for ' + BST_SEQ.length + ' keys', frames);
  return frames;
}

function bstSearchFrames(): Frame[] {
  const frames: Frame[] = [];
  const bst = createBstBuilder(frames);
  BST_SEQ.forEach(v => bst.insert(v, false));
  const root = bst.root;
  const target = 35;
  treeSnapshot(root, 'search for ' + target, frames);
  let cur = root;
  while (cur) {
    cur.state = 1;
    treeSnapshot(root, 'visit ' + cur.value, frames);
    if (cur.value === target) { cur.state = 3; treeSnapshot(root, 'found after this path', frames); break; }
    cur.state = 2;
    const side = target < cur.value ? 'left' : 'right';
    treeSnapshot(root, target + (target < cur.value ? ' < ' : ' > ') + cur.value + ' → discard ' + (side === 'left' ? 'right' : 'left') + ' subtree', frames);
    cur = cur[side];
  }
  return frames;
}

function inorderFrames(): Frame[] {
  const frames: Frame[] = [];
  const bst = createBstBuilder(frames);
  BST_SEQ.forEach(v => bst.insert(v, false));
  const root = bst.root;
  const out: number[] = [];
  const visit = (node: TreeNode | null): void => {
    if (!node) return;
    node.state = 1; treeSnapshot(root, 'descend to ' + node.value, frames); node.state = 0;
    visit(node.left);
    node.state = 3; out.push(node.value);
    treeSnapshot(root, 'emit → ' + out.join(', '), frames);
    visit(node.right);
  };
  visit(root);
  treeSnapshot(root, 'sorted output: ' + out.join(', '), frames);
  return frames;
}

function heapInsertFrames(): Frame[] {
  const frames: Frame[] = [];
  const heap = [4, 9, 7, 21, 12, 14, 18];
  const build = (): TreeNode[] => {
    const nodes: TreeNode[] = heap.map((v, i) => ({ value: v, id: i, left: null, right: null, state: 0 }));
    nodes.forEach((n, i) => {
      if (2 * i + 1 < nodes.length) n.left = nodes[2 * i + 1];
      if (2 * i + 2 < nodes.length) n.right = nodes[2 * i + 2];
    });
    return nodes;
  };
  let nodes = build();
  treeSnapshot(nodes[0], 'min-heap · parent ≤ children', frames);
  heap.push(3);
  nodes = build();
  let i = heap.length - 1;
  nodes[i].state = 1;
  treeSnapshot(nodes[0], 'append 3 at the last position', frames);
  while (i > 0) {
    const p = (i - 1) >> 1;
    nodes = build(); nodes[i].state = 1; nodes[p].state = 2;
    treeSnapshot(nodes[0], 'compare with parent ' + heap[p], frames);
    if (heap[p] <= heap[i]) break;
    [heap[p], heap[i]] = [heap[i], heap[p]];
    i = p;
    nodes = build(); nodes[i].state = 3;
    treeSnapshot(nodes[0], 'swap up to index ' + i, frames);
  }
  nodes = build();
  treeSnapshot(nodes[0], 'heap property restored · root = ' + heap[0], frames);
  return frames;
}

interface DPTableOptions {
  rows: number;
  cols: number;
  rowLabels: string[];
  colLabels: string[];
  rowTitle: string;
  colTitle: string;
}

function createDPTable(opts: DPTableOptions) {
  const { rows, cols, rowLabels, colLabels, rowTitle, colTitle } = opts;
  const dp: (number | null)[][] = Array.from({ length: rows }, () => new Array(cols).fill(null));
  const frames: Frame[] = [];
  const snap = (r: number, c: number, cap: string) => frames.push({ vals: dp.map(row => row.slice()), r, c, rowLabels, colLabels, rowTitle, colTitle, cap });
  return { dp, frames, snap };
}

function lcsFrames(): Frame[] {
  const a = 'AGGTAB', b = 'GXTXAYB';
  const { dp, frames, snap } = createDPTable({
    rows: a.length + 1, cols: b.length + 1,
    rowLabels: ['∅'].concat(a.split('')), colLabels: ['∅'].concat(b.split('')),
    rowTitle: a, colTitle: b,
  });
  for (let i = 0; i <= a.length; i++) dp[i][0] = 0;
  for (let j = 0; j <= b.length; j++) dp[0][j] = 0;
  snap(0, 0, 'empty prefix → 0');
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const match = a[i - 1] === b[j - 1];
      dp[i][j] = match ? dp[i - 1][j - 1]! + 1 : Math.max(dp[i - 1][j]!, dp[i][j - 1]!);
      snap(i, j, match ? a[i - 1] + ' = ' + b[j - 1] + ' → diagonal + 1 = ' + dp[i][j] : a[i - 1] + ' ≠ ' + b[j - 1] + ' → max(up, left) = ' + dp[i][j]);
    }
  }
  snap(a.length, b.length, 'LCS length ' + dp[a.length][b.length]);
  return frames;
}

function editDistanceFrames(): Frame[] {
  const a = 'kitten', b = 'sitting';
  const { dp, frames, snap } = createDPTable({
    rows: a.length + 1, cols: b.length + 1,
    rowLabels: ['∅'].concat(a.split('')), colLabels: ['∅'].concat(b.split('')),
    rowTitle: a, colTitle: b,
  });
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  snap(0, 0, 'baselines: pure insert / pure delete');
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j]! + 1, dp[i][j - 1]! + 1, dp[i - 1][j - 1]! + cost);
      snap(i, j, cost === 0 ? a[i - 1] + ' = ' + b[j - 1] + ' → carry diagonal ' + dp[i][j] : 'min(ins, del, sub) = ' + dp[i][j]);
    }
  }
  snap(a.length, b.length, a + ' → ' + b + ' in ' + dp[a.length][b.length] + ' edits');
  return frames;
}

function knapsackFrames(): Frame[] {
  const items = [{ w: 2, v: 3 }, { w: 3, v: 4 }, { w: 4, v: 5 }, { w: 5, v: 8 }];
  const capacity = 8;
  const { dp, frames, snap } = createDPTable({
    rows: items.length + 1, cols: capacity + 1,
    rowLabels: ['∅'].concat(items.map(it => 'w' + it.w + ' v' + it.v)),
    colLabels: Array.from({ length: capacity + 1 }, (_, w) => String(w)),
    rowTitle: 'items', colTitle: 'capacity',
  });
  for (let w = 0; w <= capacity; w++) dp[0][w] = 0;
  snap(0, 0, 'no items → value 0 at every capacity');
  for (let i = 1; i <= items.length; i++) {
    for (let w = 0; w <= capacity; w++) {
      const { w: wt, v } = items[i - 1];
      dp[i][w] = wt <= w ? Math.max(dp[i - 1][w]!, dp[i - 1][w - wt]! + v) : dp[i - 1][w];
      snap(i, w, wt <= w ? 'take ' + v + ' + dp[' + (i - 1) + '][' + (w - wt) + '] or skip → ' + dp[i][w] : 'item too heavy → inherit ' + dp[i][w]);
    }
  }
  snap(items.length, capacity, 'best value ' + dp[items.length][capacity] + ' within capacity ' + capacity);
  return frames;
}

interface SeqEntry {
  v: number;
  state: number;
}

function createSeqWorld(mode: 'stack' | 'queue' | 'linked') {
  const frames: Frame[] = [];
  const snap = (items: SeqEntry[], cap: string, ptr: string) => frames.push({ items: items.map(x => ({ ...x })), cap, ptr, mode });
  return { frames, snap };
}

function stackFrames(): Frame[] {
  const { frames, snap } = createSeqWorld('stack');
  const s: SeqEntry[] = [];
  snap(s, 'empty stack', 'top → —');
  [5, 9, 2].forEach(v => { s.push({ v, state: 1 }); snap(s, 'push(' + v + ')', 'top → ' + v); s[s.length - 1].state = 0; });
  const popped = s[s.length - 1].v;
  s[s.length - 1].state = 4; snap(s, 'pop() → ' + popped, 'top → ' + popped);
  s.pop(); snap(s, 'popped', 'top → ' + s[s.length - 1].v);
  s[s.length - 1].state = 2; snap(s, 'peek() → ' + s[s.length - 1].v + ' (no mutation)', 'top → ' + s[s.length - 1].v);
  s[s.length - 1].state = 0;
  s.push({ v: 7, state: 1 }); snap(s, 'push(7)', 'top → 7');
  return frames;
}

function queueFrames(): Frame[] {
  const { frames, snap } = createSeqWorld('queue');
  const q: SeqEntry[] = [];
  snap(q, 'empty queue', 'head → — · tail → —');
  [3, 8, 1, 6].forEach(v => { q.push({ v, state: 1 }); snap(q, 'enqueue(' + v + ')', 'head → ' + q[0].v + ' · tail → ' + v); q[q.length - 1].state = 0; });
  for (let step = 0; step < 2; step++) {
    q[0].state = 4; snap(q, 'dequeue() → ' + q[0].v, 'head → ' + q[0].v);
    q.shift(); snap(q, 'head advances (O(1) with a pointer)', 'head → ' + q[0].v + ' · tail → ' + q[q.length - 1].v);
  }
  return frames;
}

function linkedListFrames(): Frame[] {
  const { frames, snap } = createSeqWorld('linked');
  const list: SeqEntry[] = [{ v: 12, state: 0 }, { v: 37, state: 0 }, { v: 5, state: 0 }];
  snap(list, 'head → 12 → 37 → 5 → null', 'length 3');
  list[0].state = 2; snap(list, 'traverse: at 12', 'hops 1');
  list[0].state = 0; list[1].state = 2; snap(list, 'traverse: at 37 — the predecessor', 'hops 2');
  list.splice(2, 0, { v: 21, state: 1 }); snap(list, 'insertAfter(37, 21) — two pointer writes', 'length 4');
  list[2].state = 0; list[1].state = 0;
  list[3].state = 4; snap(list, 'removeAfter(21) marks 5 for removal', 'length 4');
  list.splice(3, 1); snap(list, 'node unlinked — nothing shifted', 'length 3');
  return frames;
}

interface HashEntry {
  k: string;
  state: number;
}

function hashTableFrames(): Frame[] {
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
    buckets[i].push({ k: key, state: 1 });
    snap('set("' + key + '") → hash % 8 = ' + i + (buckets[i].length > 1 ? ' · collision, chained' : ''), i);
    buckets[i][buckets[i].length - 1].state = 0;
    if (n === 5) snap('load factor ' + ((n + 1) / BUCKET_COUNT).toFixed(2) + ' — resize at 0.75', -1);
  });
  const probe = bucketIndexOf('blue');
  buckets[probe].forEach((entry, n) => {
    buckets[probe].forEach(x => { x.state = 0; });
    entry.state = entry.k === 'blue' ? 3 : 2;
    snap(entry.k === 'blue' ? 'get("blue") → hit after ' + (n + 1) + ' chain step(s)' : 'walk chain: "' + entry.k + '" ≠ "blue"', probe);
  });
  return frames;
}

/**
 * One entry per algorithm. Adding an algorithm to ALGOS without adding its
 * builder here (or vice versa) is a compile error, since AlgoKey is derived
 * from ALGOS's own keys.
 */
const ALGORITHM_BUILDERS: Record<AlgoKey, (inputs: Inputs) => Frame[]> = {
  dijkstra: dijkstraFrames, astar: astarFrames, bfs: bfsFrames, dfs: dfsFrames,
  bubble: bubbleSortFrames, insertion: insertionSortFrames, merge: mergeSortFrames,
  quick: quickSortFrames, heapsort: heapSortFrames,
  prim: primFrames, kruskal: kruskalFrames, topo: topoSortFrames, cycle: cycleDetectionFrames,
  bstInsert: bstInsertFrames, bstSearch: bstSearchFrames, inorder: inorderFrames, heapInsert: heapInsertFrames,
  lcs: lcsFrames, edit: editDistanceFrames, knapsack: knapsackFrames,
  stack: stackFrames, queue: queueFrames, linked: linkedListFrames,
  hash: hashTableFrames,
};

export function buildFrames(key: AlgoKey, inputs: Inputs): Frame[] {
  return ALGORITHM_BUILDERS[key](inputs);
}

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
