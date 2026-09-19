import React, { useMemo } from 'react';
import { ALGOS, ALGO_KEYS, FAMILIES, buildFrames, mazeWalls, randomArray, type AlgoKey, type Inputs, type VizKind } from './steps/registry';
import { useStepPlayer } from './useStepPlayer';
import { VizCanvas, type GridEdit } from './VizCanvas';
import { CodeBlock } from './CodeBlock';
import { Icon } from './Icon';

const LEGENDS: Record<VizKind, [string, string][]> = {
    grid: [['Frontier', '#796cbf'], ['Settled', '#423a6a'], ['Path', '#d2cefd'], ['Wall — drag to draw', '#595d6c'], ['Start / goal — drag to move', '#b5abfc']],
    bars: [['Comparing', '#968ae0'], ['Writing', '#d2cefd'], ['Final position', '#5d5294'], ['Unsorted', '#3f424d']],
    graph: [['In the result', '#b5abfc'], ['Under consideration', '#796cbf'], ['Rejected', '#6b4b5e'], ['Untouched', '#3f424d']],
    tree: [['On the path', '#796cbf'], ['Discarded subtree', '#423a6a'], ['Target / emitted', '#b5abfc']],
    matrix: [['Current cell', '#b5abfc'], ['Cells it depends on', '#2b2741'], ['Filled', '#232532'], ['Not yet computed', '#1d2031']],
    seq: [['Written this step', '#796cbf'], ['Read only', '#3a3168'], ['Leaving', '#5c4657']],
    hash: [['Inserted', '#796cbf'], ['Chain walk', '#3a3168'], ['Hit', '#b5abfc']],
};

interface WorkspaceProps {
    algo: AlgoKey;
    inputs: Inputs;
    setInputs: (next: Inputs) => void;
    onPick: (key: AlgoKey) => void;
    onReadNotes: (key: AlgoKey) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ algo, inputs, setInputs, onPick, onReadNotes }) => {
    const meta = ALGOS[algo];
    const family = FAMILIES.find((f) => f.id === meta.family)!;
    const frames = useMemo(() => buildFrames(algo, inputs), [algo, inputs]);
    const player = useStepPlayer(frames.length, meta.rate);
    const frame = frames[player.idx];

    const onCellEdit = (i: number, mode: GridEdit) => {
        if (mode === 'start') {
            if (i !== inputs.goal) setInputs({ ...inputs, start: i });
            return;
        }
        if (mode === 'goal') {
            if (i !== inputs.start) setInputs({ ...inputs, goal: i });
            return;
        }
        if (i === inputs.start || i === inputs.goal) return;
        const walls = new Set(inputs.walls);
        if (mode === 'erase') walls.delete(i);
        else walls.add(i);
        setInputs({ ...inputs, walls });
    };

    const tools: { label: string; run: () => void }[] =
        meta.viz === 'grid'
            ? [
                { label: 'Generate maze', run: () => setInputs({ ...inputs, walls: mazeWalls(inputs.cols, inputs.rows, inputs.start, inputs.goal) }) },
                { label: 'Clear walls', run: () => setInputs({ ...inputs, walls: new Set<number>() }) },
            ]
            : meta.viz === 'bars'
                ? [
                    { label: 'Shuffle', run: () => setInputs({ ...inputs, arr: randomArray(inputs.arr.length) }) },
                    {
                        label: 'Nearly sorted',
                        run: () => {
                            const n = inputs.arr.length;
                            const a = Array.from({ length: n }, (_, i) => 6 + Math.round((i * 90) / n));
                            for (let k = 0; k < Math.max(2, n / 8); k++) {
                                const i = Math.floor(Math.random() * n);
                                const j = Math.floor(Math.random() * n);
                                [a[i], a[j]] = [a[j], a[i]];
                            }
                            setInputs({ ...inputs, arr: a });
                        },
                    },
                    {
                        label: 'Reversed',
                        run: () => {
                            const n = inputs.arr.length;
                            setInputs({ ...inputs, arr: Array.from({ length: n }, (_, i) => 96 - Math.round((i * 90) / n)) });
                        },
                    },
                ]
                : [{ label: 'Restart sequence', run: () => { player.reset(); player.setPlaying(true); } }];

    return (
        <div className="av-work">
            <div className="av-work-head">
                <div>
                    <div className="av-kicker">{family.name}</div>
                    <h1 className="av-h1">{meta.name}</h1>
                    <p className="av-lede">{meta.tagline}</p>
                </div>
                <div className="av-work-head-right">
                    <div className="av-row av-gap-2 av-wrap av-right">
                        {ALGO_KEYS
                            .filter((k) => ALGOS[k].family === meta.family)
                            .map((k) => (
                                <button
                                    key={k}
                                    className={`av-chip${k === algo ? ' is-on' : ''}`}
                                    onClick={() => onPick(k)}
                                >
                                    {ALGOS[k].name.replace(/ \(.*\)$/, '')}
                                </button>
                            ))}
                    </div>
                    <button className="av-link" onClick={() => onReadNotes(algo)}>
                        Read the notes →
                    </button>
                </div>
            </div>

            <div className="av-split">
                <div className="av-split-main">
                    <div className="av-toolbar">
                        <div className="av-row av-gap-2">
                            <button className="av-icon-btn" title="Step back" onClick={player.stepBack}>
                                <Icon name="back" />
                            </button>
                            <button className="av-btn av-btn-primary av-play" onClick={player.toggle}>
                                {player.playing ? 'Pause' : player.idx >= frames.length - 1 && frames.length ? 'Replay' : 'Play'}
                            </button>
                            <button className="av-icon-btn" title="Step forward" onClick={player.stepFwd}>
                                <Icon name="fwd" />
                            </button>
                            <button className="av-icon-btn" title="Reset" onClick={player.reset}>
                                <Icon name="reset" />
                            </button>
                        </div>
                        <span className="av-divider-v" />
                        <div className="av-row av-gap-2 av-wrap">
                            {tools.map((t) => (
                                <button className="av-chip" key={t.label} onClick={t.run}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <span className="av-grow" />
                        <span className="av-mono av-dim av-small">
                            {frames.length ? player.idx + 1 : 0} / {frames.length} steps
                        </span>
                    </div>

                    <div className="av-stage">
                        <VizCanvas
                            viz={meta.viz}
                            frame={frame}
                            height={400}
                            opts={{ cols: inputs.cols, rows: inputs.rows, start: inputs.start, goal: inputs.goal }}
                            onCellEdit={meta.viz === 'grid' ? onCellEdit : undefined}
                            isWall={(i) => inputs.walls.has(i)}
                            startIndex={inputs.start}
                            goalIndex={inputs.goal}
                        />
                        <div className="av-stage-foot">
                            <span className="av-mono av-accent av-small av-truncate">{frame ? frame.cap : '—'}</span>
                            <span className="av-small av-dimmer">
                                {meta.viz === 'grid'
                                    ? 'Drag to draw walls · drag S and G to move them'
                                    : meta.viz === 'bars'
                                        ? `${inputs.arr.length} elements`
                                        : ''}
                            </span>
                        </div>
                    </div>

                    <div className="av-legend">
                        {LEGENDS[meta.viz].map(([label, color]) => (
                            <span className="av-legend-item" key={label}>
                                <span className="av-swatch" style={{ background: color }} />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                <aside className="av-split-side">
                    <CodeBlock code={meta.code} file={`${algo.replace(/([A-Z])/g, '-$1').toLowerCase()}.ts`} maxHeight={340} />
                    <div className="av-panel">
                        <section>
                            <div className="av-kicker">Mechanism</div>
                            <p className="av-body">{meta.idea}</p>
                        </section>
                        <section>
                            <div className="av-kicker">Use it for</div>
                            <p className="av-body av-body-sm">{meta.use}</p>
                        </section>
                        <section>
                            <div className="av-kicker">Failure mode</div>
                            <p className="av-body av-body-sm">{meta.pitfall}</p>
                        </section>
                        <table className="av-table">
                            <tbody>
                                {meta.cost.map(([k, v]) => (
                                    <tr key={k}>
                                        <td>{k}</td>
                                        <td className="av-mono av-accent av-right-cell">{v}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </aside>
            </div>
        </div>
    );
};
