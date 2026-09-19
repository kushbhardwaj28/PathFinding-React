import React from 'react';

const ICON_PATHS = {
    back: 'M208 47.9v160a16 16 0 0 1-24.6 13.5L64 145.8V208a8 8 0 0 1-16 0V48a8 8 0 0 1 16 0v62.2l119.4-75.6A16 16 0 0 1 208 47.9Z',
    fwd: 'M208 48v160a8 8 0 0 1-16 0v-62.2L72.6 221.4A16 16 0 0 1 48 207.9V48.1a16 16 0 0 1 24.6-13.5L192 110.2V48a8 8 0 0 1 16 0Z',
    reset: 'M197.7 186.3a8 8 0 0 1 0 11.4 99.4 99.4 0 0 1-70.3 29.1c-25.6 0-51.2-9.8-70.7-29.3L44 185v27a8 8 0 0 1-16 0v-46.3a8 8 0 0 1 8-8h46.3a8 8 0 0 1 0 16H55.3L68 186.3a84 84 0 0 0 118.4 0 8 8 0 0 1 11.3 0ZM224 44a8 8 0 0 0-8 8v27l-12.7-12.6a100.1 100.1 0 0 0-141.1 0 8 8 0 0 0 11.3 11.4 84 84 0 0 1 118.5 0L204.7 91H177.7a8 8 0 0 0 0 16H224a8 8 0 0 0 8-8V52a8 8 0 0 0-8-8Z',
} as const;

export const Icon: React.FC<{ name: keyof typeof ICON_PATHS; size?: number }> = ({ name, size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
        <path d={ICON_PATHS[name]} />
    </svg>
);
