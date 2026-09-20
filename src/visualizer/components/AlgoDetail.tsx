import React from 'react';
import { ALGOS, ALGO_KEYS, FAMILIES, type AlgoKey } from '../algorithms';
import { CodeBlock } from './CodeBlock';

interface AlgoDetailProps {
    algo: AlgoKey;
    onOpen: (key: AlgoKey) => void;
    onRead: (key: AlgoKey) => void;
}

export const AlgoDetail: React.FC<AlgoDetailProps> = ({ algo, onOpen, onRead }) => {
    const meta = ALGOS[algo];
    const family = FAMILIES.find((fam) => fam.id === meta.family)!;
    const sections = [
        { heading: 'Mechanism', paragraph: meta.idea },
        { heading: 'Where it earns its place', paragraph: meta.use },
        { heading: 'Failure mode', paragraph: meta.pitfall },
    ];

    return (
        <div className="av-article-page">
            <article className="av-article">
                <div className="av-kicker">{family.name}</div>
                <h1 className="av-h1 av-h1-lg">{meta.name}</h1>
                <p className="av-lede av-lede-lg">{meta.tagline}</p>
                <span className="av-rule-full" />
                {sections.map((s) => (
                    <section className="av-article-section" key={s.heading}>
                        <h2 className="av-h3">{s.heading}</h2>
                        <p className="av-prose">{s.paragraph}</p>
                    </section>
                ))}
                <section className="av-article-section">
                    <h2 className="av-h3">Reference implementation</h2>
                    <CodeBlock code={meta.code} />
                </section>
            </article>

            <aside className="av-article-side">
                <div className="av-panel">
                    <div className="av-kicker">Cost</div>
                    <table className="av-table">
                        <tbody>
                            {meta.cost.map(([metric, value]) => (
                                <tr key={metric}>
                                    <td>{metric}</td>
                                    <td className="av-mono av-accent av-right-cell">{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button className="av-btn av-btn-primary av-btn-block" onClick={() => onOpen(algo)}>
                    Open in workspace
                </button>
                <div>
                    <div className="av-kicker">Same family</div>
                    <div className="av-col">
                        {ALGO_KEYS
                            .filter((k) => ALGOS[k].family === meta.family && k !== algo)
                            .map((k) => (
                                <button className="av-list-btn" key={k} onClick={() => onRead(k)}>
                                    {ALGOS[k].name}
                                </button>
                            ))}
                    </div>
                </div>
            </aside>
        </div>
    );
};
