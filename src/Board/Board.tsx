import React, { useState, useEffect } from 'react';
import { Node } from './node/Node';
import { dijkstra, getNodesInShortestPathOrder, animateDijkstra } from '../algorithms/dijkstra';
import { astar, getNodesInShortestPathOrderAStar, animateAStar } from '../algorithms/astar';

import './board.css';
import { FINISH_NODE_PRESSED, GridData, NODE_TYPE, NORMAL_NODE_PRESSED, Position, START_NODE_PRESSED } from '../types/grid';
const DEFAULT_WIDTH = 50;
const DEFAULT_HEIGHT = 20;



export const Board: React.FC = () => {
  // constructor() {
  //   super();
  //   this.state = {
  //     width: DEFAULT_WIDTH,
  //     height: DEFAULT_HEIGHT,
  //     grid: [],
  //     startNode: {},
  //     finishNode: {},
  //     mouseIsPressed: false,
  //     pressedNodeStatus: NORMAL_NODE_PRESSED,
  //     previousObjectNode: {},
  //     isAlgoProcessing: false,
  //     currentAlgorithm: null,
  //   };
  // }

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [grid, setGrid] = useState<GridData[][]>([]);
  const [start, setStart] = useState<Position>({ x: 0, y: 0 });
  const [end, setEnd] = useState<Position>({ x: 0, y: 0 });
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [pressedNodeStatus, setPressedNodeStatus] = useState<NODE_TYPE>(NORMAL_NODE_PRESSED);
  const [previousObjectNode, setPreviousObjectNode] = useState<GridData | null>(null);
  const [isAlgoProcessing, setIsAlgoProcessing] = useState(false);
  const [currentAlgorithm, setCurrentAlgorithm] = useState(null);

  useEffect(() => {
    const startNode = { x: Math.floor(Math.random() * (DEFAULT_WIDTH - 1)), y: Math.floor(Math.random() * (DEFAULT_HEIGHT - 1)) };
    const finishNode = { x: Math.floor(Math.random() * (DEFAULT_WIDTH - 1)), y: Math.floor(Math.random() * (DEFAULT_HEIGHT - 1)) };

    const grid = getInitialGrid(DEFAULT_WIDTH, DEFAULT_HEIGHT, startNode, finishNode);

    // this.setState({ grid, startNode, finishNode });

    setGrid(grid);
    setStart(startNode);
    setEnd(finishNode);
  }, []);

  const handleMouseDown = (row: number, col: number) => {
    if (isAlgoProcessing) return;

    let startNode = start;
    let finishNode = end;
    const node = grid[row][col];
    let previousObjectNode: GridData | null = null;

    if (node.isStart) {
      startNode = { x: col, y: row };
      previousObjectNode = node;
    }
    if (node.isFinish) {
      finishNode = { x: col, y: row };
      previousObjectNode = node;
    }

    const newGrid = getNewGridWithWallToggled(grid, row, col, startNode, finishNode);

    // this.setState(
    //   grid: newGrid,
    //   startNode,
    //   finishNode,
    //   mouseIsPressed: true,
    //   pressedNodeStatus: node.nodeType,
    //   previousObjectNode: previousObjectNode,
    // });
    setGrid(newGrid);
    setStart(startNode);
    setEnd(finishNode);
    setMouseIsPressed(true);
    setPressedNodeStatus(node.nodeType);
    setPreviousObjectNode(previousObjectNode);
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (!mouseIsPressed) return;
    if (isAlgoProcessing) return;

    let startNode = start;
    let finishNode = end;
    let newGrid = grid;

    if (pressedNodeStatus === START_NODE_PRESSED || pressedNodeStatus === FINISH_NODE_PRESSED) {
      if (previousObjectNode
        && !((previousObjectNode.isStart && grid[row][col].isFinish)
          || (previousObjectNode.isFinish && grid[row][col].isStart))) {
        newGrid = getNewGridWithDraggedObject(grid, previousObjectNode.row, previousObjectNode.col, row, col);
        if (previousObjectNode.isStart) {
          startNode = { x: col, y: row };
        }
        if (previousObjectNode.isFinish) {
          finishNode = { x: col, y: row };
        }
      }
    } else {
      newGrid = getNewGridWithWallToggled(grid, row, col, startNode, finishNode);
    }

    // this.setState({ grid: newGrid, startNode, finishNode, previousObjectNode: grid[row][col] });
    setGrid(newGrid);
    setStart(startNode);
    setEnd(finishNode);
    setPreviousObjectNode(grid[row][col]);
  }

  const handleMouseUp = () => {
    if (isAlgoProcessing) return;

    // this.setState({ mouseIsPressed: false, pressedNodeStatus: NORMAL_NODE_PRESSED, previousObjectNode: null });
    setMouseIsPressed(false);
    setPressedNodeStatus(NORMAL_NODE_PRESSED);
    setPreviousObjectNode(null);
  }

  const visualizeDijkstra = () => {
    setIsAlgoProcessing(true);
    clearBoard(false);
    // const { grid } = this.state;
    const startNode = grid[start.y][start.x];
    const finishNode = grid[end.y][end.x];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder, () => setIsAlgoProcessing(false));
  }

  const visualizeAStar = () => {
    setIsAlgoProcessing(true);
    clearBoard(false);
    // const { grid } = this.state;
    const startNode = grid[start.y][start.x];
    const finishNode = grid[end.y][end.x];
    let nodesToAnimate: GridData[] = [];
    astar(startNode, finishNode, nodesToAnimate, grid, '');
    const nodesInShortestPathOrder = getNodesInShortestPathOrderAStar(finishNode);
    animateAStar(nodesToAnimate, nodesInShortestPathOrder, () => setIsAlgoProcessing(false));
    ;
  }

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = +event.target.value;
    const startNode = { x: Math.floor(Math.random() * (val - 1)), y: Math.floor(Math.random() * (height - 1)) };
    const finishNode = { x: Math.floor(Math.random() * (val - 1)), y: Math.floor(Math.random() * (height - 1)) };

    const grid = getInitialGrid(val, height, startNode, finishNode);

    // this.setState({ grid: grid, startNode, finishNode, width: event.target.value });
    setGrid(grid);
    setStart(startNode);
    setEnd(finishNode);
    setWidth(val);
  }

  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = +event.target.value;
    const startNode = { x: Math.floor(Math.random() * (width - 1)), y: Math.floor(Math.random() * (val - 1)) };
    const finishNode = { x: Math.floor(Math.random() * (width - 1)), y: Math.floor(Math.random() * (val - 1)) };

    const grid = getInitialGrid(width, val, startNode, finishNode);

    // this.setState({ grid: grid, startNode, finishNode, height: event.target.value });
    setGrid(grid);
    setStart(startNode);
    setEnd(finishNode);
    setHeight(val);
  }

  const clearBoard = (clearWall: boolean) => {
    const newGrid = grid.slice();
    const baseClasses = ['node', 'start', 'finish'];
    if (!clearWall) {
      baseClasses.push('wall');
    }

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const domElement = document.getElementById(`node-${row}-${col}`);
        if (!domElement) {
          return;
        }
        if (grid[row] && grid[row][col]) {
          const node = grid[row][col];

          let intersectionList = ['node'];
          if (domElement && domElement.className) {
            intersectionList = baseClasses.filter(value => -1 !== domElement.className.split(' ').indexOf(value));
          }

          domElement.className = intersectionList.join(' ');
          const newNode: GridData = {
            ...node,
            distance: Infinity,
            startDistance: Infinity,
            visited: false,
            isVisited: false,
            previousNode: null,
            direction: null,
            totalDistance: Infinity,
            heuristicDistance: null,
            path: null,
            weight: 0,
            isWall: node.isWall ? !clearWall : node.isWall,
            status: node.isWall ? clearWall ? 'unvisited' : 'wall' : 'unvisited',
          };
          newGrid[row][col] = newNode;
        }
      }
    }
    setGrid(newGrid);
  }

  return (
    <>
      <div id="controls">
        <button disabled={isAlgoProcessing} id="primary-button" onClick={() => visualizeDijkstra()}>
          Visualize Dijkstra's Algorithm
        </button>
        <button disabled={isAlgoProcessing} id="primary-button" onClick={() => visualizeAStar()}>
          Visualize A*
        </button>
        <button disabled={isAlgoProcessing} id="secondary-button" onClick={() => clearBoard(true)}>
          Clear Board
        </button>
        <div className="display-flex">
          <span>Width ({width}): </span>
          <input
            id="grid-row"
            type="range"
            min="10" max="70"
            value={width}
            onChange={(event) => handleWidthChange(event)}
            step="1" />
        </div>
        <div className="display-flex">
          <span>Height ({height}): </span>
          <input
            id="grid-col"
            type="range"
            min="10" max="30"
            value={height}
            onChange={(event) => handleHeightChange(event)}
            step="1" />
        </div>
      </div>
      <div className="legends display-flex flex-col">
        <div className="display-flex">Start: <span className="legend start"></span> (drag me on board to reposition)</div>
        <div className="display-flex">Escape: <span className="legend finish"></span> (drag me on board to reposition)</div>
        <div className="display-flex">Wall: <span className="legend wall"></span>(Just click and draw on add wall)</div>
        <div className="display-flex">Successful escape: <span className="legend shortest-path-finish"></span></div>
        <div className="display-flex">Visited: <span className="legend visited"></span></div>
        <div className="display-flex">Shortest path: <span className="legend shortest-path"></span></div>
      </div>
      <table className="grid">
        <tbody>
          {grid.map((row, rowIdx) => {
            return (
              <tr id={`row-${rowIdx}`} key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      // mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        handleMouseEnter(row, col)
                      }
                      onMouseUp={() => handleMouseUp()}
                      row={row}
                      id={`${row}-${col}`}></Node>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

const getInitialGrid = (width: number, height: number, startPos: Position, finishPos: Position): GridData[][] => {
  const grid: GridData[][] = [];

  for (let row = 0; row < height; row++) {
    const currentRow: GridData[] = [];
    for (let col = 0; col < width; col++) {
      const node = createNode(col, row, startPos, finishPos);
      currentRow.push(node);
    }
    grid.push(currentRow);
  }
  return grid;
}

const createNode = (col: number, row: number, startPos: Position, finishPos: Position): GridData => {
  const isStart = row === startPos.y && col === startPos.x;
  const isFinish = row === finishPos.y && col === finishPos.x;

  const data: GridData = {
    col,
    row,
    id: `${row}-${col}`,
    isStart: isStart,
    isFinish: isFinish,
    distance: Infinity,
    totalDistance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
    nodeType: isStart ? START_NODE_PRESSED : isFinish ? FINISH_NODE_PRESSED : NORMAL_NODE_PRESSED,
    direction: null,
    heuristicDistance: null,
    path: null,
    weight: 0,
    status: 'unvisited',
    startDistance: 0,
    visited: false
  };

  return data;
};

const getNewGridWithWallToggled = (grid: GridData[][], row: number, col: number, startNode: Position, finishNode: Position) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  if (!(node.isStart || node.isFinish)) {
    const newNode: GridData = {
      ...node,
      isWall: !node.isWall,
      status: node.isWall ? 'unvisited' : 'wall',
    };
    newGrid[row][col] = newNode;
  }
  return newGrid;
};

const getNewGridWithDraggedObject = (grid: GridData[][], prevRow: number, prevCol: number, currentRow: number, currentCol: number) => {
  const newGrid = grid.slice();
  const prevNode = newGrid[prevRow][prevCol];
  const currentNode = newGrid[currentRow][currentCol];
  if (prevNode.isStart) {
    const newPrev: GridData = {
      ...prevNode,
      isStart: false,
      nodeType: NORMAL_NODE_PRESSED,
    };
    const newCurrent: GridData = {
      ...currentNode,
      isStart: true,
      nodeType: START_NODE_PRESSED,
      isWall: currentNode.isWall ? false : currentNode.isWall,
    };
    newGrid[prevRow][prevCol] = newPrev;
    newGrid[currentRow][currentCol] = newCurrent;
  }
  if (prevNode.isFinish) {
    const newPrev: GridData = {
      ...prevNode,
      isFinish: false,
      nodeType: NORMAL_NODE_PRESSED,
    };
    const newCurrent: GridData = {
      ...currentNode,
      isFinish: true,
      nodeType: FINISH_NODE_PRESSED,
      isWall: currentNode.isWall ? false : currentNode.isWall,
    };
    newGrid[prevRow][prevCol] = newPrev;
    newGrid[currentRow][currentCol] = newCurrent;
  }
  return newGrid;
};