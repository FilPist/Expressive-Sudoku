import type { Difficulty, Grid } from './types';

const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const findEmpty = (grid: Grid): [number, number] | null => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === null) {
        return [r, c];
      }
    }
  }
  return null;
};

export const isValid = (grid: Grid, row: number, col: number, num: number): boolean => {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num && col !== i) return false;
  }
  for (let i = 0; i < 9; i++) {
    if (grid[i][col] === num && row !== i) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === num && (boxRow + i !== row || boxCol + j !== col)) {
        return false;
      }
    }
  }
  return true;
};

const solve = (grid: Grid): boolean => {
  const empty = findEmpty(grid);
  if (!empty) return true;

  const [row, col] = empty;
  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (const num of numbers) {
    // Check if the number is valid in the current spot (using the full grid state)
    let tempGrid = JSON.parse(JSON.stringify(grid));
    tempGrid[row][col] = num;
    if (isValid(tempGrid, row, col, num)) {
      grid[row][col] = num;
      if (solve(grid)) {
        return true;
      }
      grid[row][col] = null;
    }
  }
  return false;
};


export const generateSudoku = (difficulty: Difficulty): { puzzle: Grid, solution: Grid } => {
  const emptyGrid: Grid = Array(9).fill(null).map(() => Array(9).fill(null));
  solve(emptyGrid);
  const solution = JSON.parse(JSON.stringify(emptyGrid));

  let cellsToRemove: number;
  switch (difficulty) {
    case 'easy': cellsToRemove = 35; break;
    case 'medium': cellsToRemove = 45; break;
    case 'hard': cellsToRemove = 52; break;
    case 'expert': cellsToRemove = 58; break;
    default: cellsToRemove = 45;
  }

  const puzzle = JSON.parse(JSON.stringify(solution));
  const cells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      cells.push([r, c]);
    }
  }

  shuffle(cells);

  for (let i = 0; i < cellsToRemove; i++) {
    const [r, c] = cells[i];
    puzzle[r][c] = null;
  }
  
  return { puzzle, solution };
};
