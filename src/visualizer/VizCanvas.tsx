import React, { useEffect, useRef } from 'react';
import { render, type RenderOpts } from './steps/renderers';
import type { Frame, VizKind } from './steps/registry';

export type GridEdit = 'wall' | 'erase' | 'start' | 'goal';

interface VizCanvasProps {
    viz: VizKind;
    frame?: Frame;
    opts?: RenderOpts;
    height: number;
    /** only wired for the grid renderer */
    onCellEdit?: (index: number, mode: GridEdit) => void;
    isWall?: (index: number) => boolean;
    startIndex?: number;
    goalIndex?: number;
}

export const VizCanvas: React.FC<VizCanvasProps> = ({
    viz,
    frame,
    opts,
    height,
    onCellEdit,
    isWall,
    startIndex,
    goalIndex,
}) => {
    const ref = useRef<HTMLCanvasElement>(null);
    // renderers write hit-test geometry back into this object
    const renderOpts = useRef<RenderOpts>({});
    const drag = useRef<GridEdit | null>(null);

    useEffect(() => {
        renderOpts.current = { ...renderOpts.current, ...opts };
        render(ref.current, viz, frame, renderOpts.current);
    }, [viz, frame, opts]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(() => render(el, viz, frame, renderOpts.current));
        ro.observe(el);
        return () => ro.disconnect();
    }, [viz, frame]);

    const cellAt = (e: React.MouseEvent) => {
        const geometry = renderOpts.current.geom;
        const el = ref.current;
        if (!geometry || !el || !opts?.cols || !opts?.rows) return -1;
        const r = el.getBoundingClientRect();
        const x = Math.floor((e.clientX - r.left - geometry.ox) / geometry.cell);
        const y = Math.floor((e.clientY - r.top - geometry.oy) / geometry.cell);
        if (x < 0 || y < 0 || x >= opts.cols || y >= opts.rows) return -1;
        return y * opts.cols + x;
    };

    const down = (e: React.MouseEvent) => {
        if (viz !== 'grid' || !onCellEdit) return;
        const i = cellAt(e);
        if (i < 0) return;
        if (i === startIndex) drag.current = 'start';
        else if (i === goalIndex) drag.current = 'goal';
        else {
            drag.current = isWall?.(i) ? 'erase' : 'wall';
            onCellEdit(i, drag.current);
        }
    };

    const move = (e: React.MouseEvent) => {
        if (!drag.current || !onCellEdit) return;
        const i = cellAt(e);
        if (i >= 0) onCellEdit(i, drag.current);
    };

    const up = () => {
        drag.current = null;
    };

    return (
        <canvas
            ref={ref}
            className="av-canvas"
            style={{ height, cursor: viz === 'grid' && onCellEdit ? 'crosshair' : 'default' }}
            onMouseDown={down}
            onMouseMove={move}
            onMouseUp={up}
            onMouseLeave={up}
        />
    );
};
