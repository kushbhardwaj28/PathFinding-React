# Stepwise — an algorithm visualizer

A React + TypeScript app that animates 24 algorithms frame by frame across six
families: pathfinding, sorting, graphs, trees, dynamic programming and data
structures. Every algorithm can be played, paused, stepped forward and
**backward**, and compared side by side with another.

## Running it

```bash
npm install
npm run dev        # start the dev server
npm run lint       # eslint
npx tsc -p tsconfig.app.json --noEmit   # type-check the app
```

## How it works

Each algorithm is run **eagerly, once**, and produces a list of *frames*. A
frame is a complete snapshot of the state to draw (for example the whole grid,
or the whole array plus which bars are highlighted). The UI just plays that
list back, so stepping backward is only an index change — nothing is re-run.

```
Inputs ──▶ builder (algorithms/) ──▶ Frame[] ──▶ renderer (renderers/) ──▶ canvas
                                        ▲
                                useStepPlayer (hooks/)  picks which frame to show
```

- A **builder** is a function `(inputs: Inputs) => Frame[]`. It runs the
  algorithm and calls `snap(...)` whenever something worth showing happens.
- A **renderer** draws one frame of one *visualization kind* onto a canvas.
  Several algorithms share a kind (all four pathfinders use `grid`).

## Folder structure

```
src/visualizer/
├── AlgoVisualizer.tsx        top-level screen switcher (catalog / visualize / compare / notes)
├── visualizer.css
├── algorithms/               WHAT each algorithm does
│   ├── types.ts              VizKind, FamilyId, AlgoMeta, Inputs, Frame
│   ├── catalog.ts            FAMILIES + ALGOS: names, prose, cost table, display code
│   ├── index.ts              wires every builder into ALGORITHM_BUILDERS; exports buildFrames()
│   ├── utils.ts              defaultInputs, randomArray, mazeWalls
│   ├── pathfinding/          one file per algorithm + shared helper       (viz: grid)
│   │   ├── world.ts          createGridWorld: wall mask, neighbors, path tracing
│   │   ├── bfs.ts  dfs.ts  dijkstra.ts  astar.ts
│   │   └── index.ts          re-exports the builders
│   ├── sorting/              bubble-sort, insertion-sort, merge-sort, quick-sort, heap-sort  (viz: bars)
│   ├── graphs/               prim, kruskal, topological-sort, cycle-detection   (viz: graph)
│   ├── trees/                bst-insert, bst-search, inorder, heap-insert       (viz: tree)
│   ├── dynamic-programming/  lcs, edit-distance, knapsack                       (viz: matrix)
│   └── data-structures/      stack, queue, linked-list, hash-table              (viz: seq, hash)
├── renderers/                HOW each visualization kind is drawn
│   ├── index.ts              RENDERERS map + render()
│   ├── types.ts, theme.ts    shared canvas types, colors, fonts
│   └── grid.ts bars.ts graph.ts tree.ts matrix.ts seq.ts hash.ts
├── components/               React UI (Catalog, Workspace, Compare, AlgoDetail, VizCanvas, ...)
└── hooks/useStepPlayer.ts    play / pause / step / reset over a Frame[]
```

The UI components are fully data-driven from `ALGOS`, so adding an algorithm
never requires touching them.

## Adding a new algorithm

Example: **selection sort**, which reuses the existing `bars` visualization.

### 1. Add its metadata — `algorithms/catalog.ts`

Add an entry to `ALGOS`. The key (`selection`) is the algorithm's id everywhere.

```ts
selection: {
  name: 'Selection sort', family: 'sort', viz: 'bars', big: 'O(n²)', rate: 34,
  tagline: 'Repeatedly select the smallest remaining value and put it in place.',
  idea: 'Scan the unsorted suffix for its minimum, swap it to the front of the suffix.',
  use: 'Teaching, and when writes are far more expensive than reads.',
  pitfall: 'Always O(n²) comparisons, even on already-sorted input.',
  cost: [['Best', 'O(n²)'], ['Average', 'O(n²)'], ['Space', 'O(1)'], ['Stable', 'No']],
  code: ['function selectionSort(a) {', /* ...display-only lines... */ '}'],
},
```

| field | meaning |
| --- | --- |
| `family` | which section of the catalog it appears in (`FamilyId`) |
| `viz` | which renderer draws it (`VizKind`) |
| `big` | headline complexity shown on its card |
| `rate` | playback speed in steps per second |
| `cost` | rows of the cost table (`[label, value]`) |
| `code` | reference source shown next to the animation — display only, never executed |

### 2. Write its frame builder — a new file in the family folder

Create `algorithms/sorting/selection-sort.ts`, then export it from
`algorithms/sorting/index.ts` (`export { selectionSortFrames } from './selection-sort';`).

```ts
import type { Frame, Inputs } from '../types';
import { createBarWorld } from './world';

export function selectionSortFrames(inputs: Inputs): Frame[] {
  const { a, frames, sorted, snap, cmps } = createBarWorld(inputs.arr);
  for (let start = 0; start < a.length - 1; start++) {
    let smallest = start;
    for (let i = start + 1; i < a.length; i++) {
      cmps.n++; snap([smallest, i], 'compare ' + a[smallest] + ' : ' + a[i]);
      if (a[i] < a[smallest]) smallest = i;
    }
    if (smallest !== start) {
      [a[start], a[smallest]] = [a[smallest], a[start]];
      snap([start, smallest], 'swap');
    }
    sorted.add(start);
    snap([], 'index ' + start + ' final');
  }
  for (let i = 0; i < a.length; i++) sorted.add(i);
  snap([], 'sorted · ' + cmps.n + ' comparisons');
  return frames;
}
```

Each family folder has a small shared helper (here `createBarWorld` in
`sorting/world.ts`) that owns the shared state and the `snap` function. Use it, so your builder is
only the algorithm itself. Every frame carries a caption (`cap`) — the line of
text shown under the canvas — which the helpers' `snap` takes as an argument.

### 3. Register the builder — `algorithms/index.ts`

Import it and add one line to `ALGORITHM_BUILDERS`:

```ts
import { ..., selectionSortFrames } from './sorting';   // resolves to sorting/index.ts

const ALGORITHM_BUILDERS = {
  // ...
  selection: selectionSortFrames,
};
```

`AlgoKey` is derived from the keys of `ALGOS`, and `ALGORITHM_BUILDERS` is typed
`Record<AlgoKey, ...>`. So if you do step 1 without step 3 (or the reverse),
**TypeScript refuses to compile** — you cannot ship a half-registered algorithm.

That's it. The algorithm now appears in the catalog, the workspace, the
compare dropdowns and the notes page. Run `npx tsc -p tsconfig.app.json --noEmit`
and open it in `npm run dev`.

### Adding a whole new family

If it doesn't fit an existing family (say, "String matching"):

1. Add the id to `FamilyId` in `algorithms/types.ts` and an entry to `FAMILIES` in `catalog.ts`.
2. Create an `algorithms/string-matching/` folder with one file per builder, an `index.ts` that re-exports them, and (optionally) a `world.ts` helper.
3. Register them as in steps 1–3 above.

### Adding a new visualization kind

Only needed when no existing renderer can draw your frames.

1. Add the name to `VizKind` in `algorithms/types.ts`.
2. Create `renderers/<kind>.ts` exporting `(ctx, w, h, frame, opts) => void`, using `COLORS`/`MONO` from `theme.ts`.
3. Add it to `RENDERERS` in `renderers/index.ts` (typed `Record<VizKind, ...>`, so a missing entry is a compile error).
4. Add a legend for it to `LEGENDS` in `components/Workspace.tsx` (also `Record<VizKind, ...>`).

## Frame reference

Every frame has `cap: string`. The remaining fields depend on the viz kind and
are read only by the matching renderer:

| viz | fields |
| --- | --- |
| `grid` | `cells: Uint8Array` — `0` empty, `1` wall, `2` frontier, `3` visited, `4` path |
| `bars` | `arr: number[]`, `active: number[]` (highlighted indexes), `sorted: Set<number>` |
| `graph` | `graph: { nodes: {label,x,y}[], edges: number[][] }`, `directed`, `nodeStates: number[]`, `edgeStates: number[]` |
| `tree` | `nodes: {value,x,depth,id,state}[]`, `links: [node, node][]` |
| `matrix` | `vals: (number\|null)[][]`, `row`, `col`, `rowLabels`, `colLabels`, `rowTitle`, `colTitle` |
| `seq` | `items: {value,state}[]`, `ptr: string`, `mode: 'stack'\|'queue'\|'linked'` |
| `hash` | `buckets: {key,state}[][]`, `probe: number` |

`state` numbers are per-renderer highlight codes (roughly `0` idle, `1` active,
`2` secondary, `3` success, `4` removed/rejected) — see the matching file in
`renderers/`.

## Conventions

- **Snapshots, not references.** `snap()` must copy mutable state (`.slice()`,
  `new Set(...)`, `Uint8Array.from(...)`) — frames must never change after they
  are pushed.
- **Keep a builder self-contained.** Don't edit another algorithm's builder to
  add yours; share setup through the family folder's `world.ts` helper instead. One algorithm per file.
- **Descriptive names.** Prefer `neighbor`, `newDistance`, `nodeStates` over
  single letters; single-letter names are fine only for tiny loop indices.
