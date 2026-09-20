import React, { useMemo, useState } from 'react';
import { ALGOS, ALGO_KEYS, FAMILIES, buildFrames, mazeWalls, randomArray, type AlgoKey, type Inputs } from '../algorithms';
import { useStepPlayer } from '../hooks/useStepPlayer';
import { VizCanvas } from './VizCanvas';
import { Icon } from './Icon';

interface CompareProps {
    inputs: Inputs;
    setInputs: (next: Inputs) => void;
}

export const Compare: React.FC<CompareProps> = ({ inputs, setInputs }) => {
    const [left, setLeft] = useState<AlgoKey>('bfs');
    const [right, setRight] = useState<AlgoKey>('astar');

    const framesL = useMemo(() => buildFrames(left, inputs), [left, inputs]);
    const framesR = useMemo(() => buildFrames(right, inputs), [right, inputs]);

    // one clock for both panes: step counts are the comparison
    const rate = Math.min(ALGOS[left].rate, ALGOS[right].rate);
    const player = useStepPlayer(Math.max(framesL.length, framesR.length), rate);

    const panes = [
        { key: left, set: setLeft, frames: framesL },
        { key: right, set: setRight, frames: framesR },
    ];

    const newInput = () =>
        setInputs({
            ...inputs,
            arr: randomArray(inputs.arr.length),
            walls: mazeWalls(inputs.cols, inputs.rows, inputs.start, inputs.goal),
        });

    return (
        <div className="av-page">
            <div className="av-work-head">
                <div>
                    <h1 className="av-h1">Compare</h1>
                    <p className="av-lede">
                        Two algorithms, one clock, the same input. Step counts are the honest comparison —
                        wall-clock time is not.
                    </p>
                </div>
                <div className="av-row av-gap-2">
                    <button className="av-icon-btn" onClick={player.stepBack}>
                        <Icon name="back" />
                    </button>
                    <button className="av-btn av-btn-primary av-play" onClick={player.toggle}>
                        {player.playing ? 'Pause' : 'Play both'}
                    </button>
                    <button className="av-icon-btn" onClick={player.stepFwd}>
                        <Icon name="fwd" />
                    </button>
                    <button className="av-btn av-btn-ghost" onClick={player.reset}>
                        Reset
                    </button>
                    <button className="av-btn av-btn-ghost" onClick={newInput}>
                        New input
                    </button>
                </div>
            </div>

            <div className="av-compare">
                {panes.map((pane, paneIndex) => {
                    const i = Math.min(player.idx, pane.frames.length - 1);
                    const meta = ALGOS[pane.key];
                    return (
                        <div className="av-compare-pane" key={paneIndex}>
                            <div className="av-row av-gap-3">
                                <select
                                    className="av-select"
                                    value={pane.key}
                                    onChange={(e) => pane.set(e.target.value as AlgoKey)}
                                >
                                    {ALGO_KEYS.map((k) => (
                                        <option value={k} key={k}>
                                            {ALGOS[k].name}
                                        </option>
                                    ))}
                                </select>
                                <span className="av-mono av-dim av-small av-nowrap">
                                    {i + 1} / {pane.frames.length} steps
                                </span>
                            </div>
                            <div className="av-stage av-stage-sm">
                                <VizCanvas
                                    viz={meta.viz}
                                    frame={pane.frames[i]}
                                    height={268}
                                    opts={{ cols: inputs.cols, rows: inputs.rows, start: inputs.start, goal: inputs.goal }}
                                />
                                <div className="av-stage-foot">
                                    <span className="av-mono av-accent av-small av-truncate">
                                        {pane.frames[i] ? pane.frames[i].cap : '—'}
                                    </span>
                                </div>
                            </div>
                            <div className="av-row av-gap-4 av-small av-dim">
                                <span>{meta.big}</span>
                                <span>{FAMILIES.find((f) => f.id === meta.family)!.name}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
