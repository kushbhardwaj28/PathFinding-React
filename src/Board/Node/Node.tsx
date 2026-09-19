import React from 'react';

import './node.css';

interface NodeProps {
  col: number,
  isFinish: boolean,
  isStart: boolean,
  isWall: boolean,
  onMouseDown: (row: number, col: number) => void,
  onMouseEnter: (row: number, col: number) => void,
  onMouseUp: () => void,
  row: number,
  id: string,
}

export const Node: React.FC<NodeProps> = (props) => {
  const {
    col,
    isFinish,
    isStart,
    isWall,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    row,
    id,
  } = props;

  let extraClassName = '';
  if (isFinish) {
    extraClassName += 'finish ';
  }
  if (isStart) {
    extraClassName += 'start ';
  } if (isWall) {
    extraClassName += 'wall ';
  }

  return (
    <td
      id={`node-${id}`}
      className={`node ${extraClassName}`}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp()}>
    </td>
  );
}

