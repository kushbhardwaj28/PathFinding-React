export const START_NODE_PRESSED = 'start';
export const FINISH_NODE_PRESSED = 'finish';
export const NORMAL_NODE_PRESSED = 'normal';
const directions = {
    right: 'right',
    left: 'left',
    down: 'down',
    up: 'up',
    up_right: 'up-right',
    up_left: 'up-left',
    down_right: 'down-right',
    down_left: 'down-left'
} as const;


export type NODE_STATUS = 'unvisited' | 'visited' | 'wall';
export type NODE_TYPE = typeof START_NODE_PRESSED | typeof FINISH_NODE_PRESSED | typeof NORMAL_NODE_PRESSED;
type NODE_DIRECTION = typeof directions[keyof typeof directions];
export type PATH_STEP = 'f' | 'l' | 'r';


export interface GridData {
    col: number,
    row: number,
    id: string,
    isStart: boolean,
    isFinish: boolean,
    distance: number,
    totalDistance: number,
    isVisited: boolean,
    isWall: boolean,
    previousNode: GridData | null,
    nodeType: NODE_TYPE,
    direction: NODE_DIRECTION | null,
    heuristicDistance: number | null,
    path?: PATH_STEP[] | null,
    weight: number,
    status: NODE_STATUS,
    startDistance: number,
    visited: boolean
};

export interface Position {
    x: number,
    y: number,
}
