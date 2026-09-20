import React from 'react';
import { ALGOS, ALGO_KEYS, FAMILIES, type AlgoKey } from '../algorithms';

interface CatalogProps {
    current: AlgoKey;
    onOpen: (key: AlgoKey) => void;
    onRead: (key: AlgoKey) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ current, onOpen, onRead }) => (
    <div className="av-page">
        <header className="av-page-head">
            <h1 className="av-h1">Catalog</h1>
            <p className="av-lede">
                Six families, one step engine. Open any algorithm in the workspace to drive it frame by
                frame, or read the notes for cost and failure modes.
            </p>
        </header>

        {FAMILIES.map((fam) => (
            <section className="av-family" key={fam.id}>
                <div className="av-family-head">
                    <h2 className="av-h3">{fam.name}</h2>
                    <span className="av-dim av-small">{fam.note}</span>
                    <span className="av-rule" />
                </div>
                <div className="av-card-grid">
                    {ALGO_KEYS
                        .filter((k) => ALGOS[k].family === fam.id)
                        .map((k) => (
                            <article className={`av-card${k === current ? ' is-current' : ''}`} key={k}>
                                <div className="av-card-top">
                                    <span className="av-card-title">{ALGOS[k].name}</span>
                                    <span className="av-mono av-accent av-small">{ALGOS[k].big}</span>
                                </div>
                                <p className="av-card-body">{ALGOS[k].tagline}</p>
                                <div className="av-row av-gap-2">
                                    <button className="av-btn av-btn-primary" onClick={() => onOpen(k)}>
                                        Visualize
                                    </button>
                                    <button className="av-btn av-btn-ghost" onClick={() => onRead(k)}>
                                        Notes
                                    </button>
                                </div>
                            </article>
                        ))}
                </div>
            </section>
        ))}
    </div>
);
