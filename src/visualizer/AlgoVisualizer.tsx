import React, { useState } from 'react';
import { defaultInputs, type AlgoKey, type Inputs } from './algorithms';
import { Catalog } from './components/Catalog';
import { Workspace } from './components/Workspace';
import { AlgoDetail } from './components/AlgoDetail';
import { Compare } from './components/Compare';
import './visualizer.css';

type Screen = 'catalog' | 'work' | 'detail' | 'compare';

const NAV: [Screen, string][] = [
    ['catalog', 'Catalog'],
    ['work', 'Visualize'],
    ['compare', 'Compare'],
];

export const AlgoVisualizer: React.FC = () => {
    const [screen, setScreen] = useState<Screen>('work');
    const [algo, setAlgo] = useState<AlgoKey>('astar');
    const [detail, setDetail] = useState<AlgoKey>('astar');
    // one input set shared by the workspace and both compare panes
    const [inputs, setInputs] = useState<Inputs>(() => defaultInputs());

    const openWorkspace = (key: AlgoKey) => {
        setAlgo(key);
        setDetail(key);
        setScreen('work');
    };

    const openDetail = (key: AlgoKey) => {
        setDetail(key);
        setScreen('detail');
    };

    return (
        <div className="av-root">
            <header className="av-nav">
                <button className="av-brand" onClick={() => setScreen('catalog')}>
                    <span className="av-brand-name">Stepwise</span>
                    <span className="av-kicker">24 algorithms</span>
                </button>
                <span className="av-grow" />
                <nav className="av-row av-gap-1">
                    {NAV.map(([key, label]) => (
                        <button
                            key={key}
                            className={`av-nav-btn${screen === key || (key === 'work' && screen === 'detail') ? ' is-on' : ''}`}
                            onClick={() => setScreen(key)}
                        >
                            {label}
                        </button>
                    ))}
                </nav>
            </header>

            {screen === 'catalog' && <Catalog current={algo} onOpen={openWorkspace} onRead={openDetail} />}
            {screen === 'work' && (
                <Workspace algo={algo} inputs={inputs} setInputs={setInputs} onPick={openWorkspace} onReadNotes={openDetail} />
            )}
            {screen === 'detail' && <AlgoDetail algo={detail} onOpen={openWorkspace} onRead={setDetail} />}
            {screen === 'compare' && <Compare inputs={inputs} setInputs={setInputs} />}
        </div>
    );
};
