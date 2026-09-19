import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Drives a frame list. Frames are snapshots, so stepping backwards is just
 * an index change — no re-running the algorithm.
 */
export function useStepPlayer(frameCount: number, rate: number) {
    const [idx, setIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const last = useRef(0);
    const animationFrameId = useRef(0);

    useEffect(() => {
        setIdx(0);
        setPlaying(false);
    }, [frameCount]);

    useEffect(() => {
        if (!playing || frameCount === 0) return;
        const gap = 1000 / Math.max(0.5, rate);
        const loop = (timestamp: number) => {
            if (timestamp - last.current >= gap) {
                last.current = timestamp;
                setIdx((currentIndex) => {
                    if (currentIndex >= frameCount - 1) {
                        setPlaying(false);
                        return currentIndex;
                    }
                    return currentIndex + 1;
                });
            }
            animationFrameId.current = requestAnimationFrame(loop);
        };
        animationFrameId.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId.current);
    }, [playing, rate, frameCount]);

    const toggle = useCallback(() => {
        setPlaying((p) => {
            if (!p && idx >= frameCount - 1) setIdx(0);
            return !p;
        });
    }, [idx, frameCount]);

    const stepFwd = useCallback(() => {
        setPlaying(false);
        setIdx((i) => Math.min(frameCount - 1, i + 1));
    }, [frameCount]);

    const stepBack = useCallback(() => {
        setPlaying(false);
        setIdx((i) => Math.max(0, i - 1));
    }, []);

    const reset = useCallback(() => {
        setPlaying(false);
        setIdx(0);
    }, []);

    return { idx, playing, toggle, stepFwd, stepBack, reset, setIdx, setPlaying };
}
