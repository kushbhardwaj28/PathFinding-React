import type { AlgoMeta, Family } from './types';

export const FAMILIES: Family[] = [
  { id: 'path', name: 'Pathfinding', note: 'Shortest routes on a 4-neighbour grid.' },
  { id: 'sort', name: 'Sorting', note: 'Comparison sorts over a random array.' },
  { id: 'graph', name: 'Graph', note: 'Spanning trees, ordering, cycles.' },
  { id: 'tree', name: 'Trees', note: 'BST operations and heap ordering.' },
  { id: 'dp', name: 'Dynamic programming', note: 'Tables filled bottom-up.' },
  { id: 'ds', name: 'Data structures', note: 'Operation-by-operation state.' }
];

/**
 * One entry per algorithm — name, grouping, prose, and a reference code
 * snippet for display (not executed). This is metadata only; the actual
 * step-by-step animation logic lives in the per-family builder files
 * (pathfinding.ts, sorting.ts, graphs.ts, trees.ts, dynamic-programming.ts,
 * data-structures.ts) and is wired up in index.ts. See the README for the
 * full "add a new algorithm" guide.
 */
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
