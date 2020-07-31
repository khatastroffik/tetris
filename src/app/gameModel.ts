/**
 * Grid (e.g. Tetris playing board) type
 */
export type Grid = number[][];

/**
 * Tetromino type
 */
export type Tetromino = {
  originX: number;
  originY: number;
  shape: Grid;
}

export const GameKeys: Array<string> = [
  'ArrowUp', // rotate Tetromino clockwise
  'ArrowDown', // rotate Tetromino counter-clockwise
  'ArrowLeft', // move Tetromino to the left
  'ArrowRight', // move Tetromino to the right
  'Space' // drop Tetromino
];

/**
 *  CSS style name for the colors of the Tetrominos
 */
const TetrominoColorStyles: string[] = [
  'cyan', // "1" for shape I
  'blue', // "2" for shape J
  'orange', // "3" for shape L
  'yellow', // "4" for shape O
  'lime', // "5" for shape S
  'purple', // "6" for shape T
  'red' // "7" for shape Z
];

/**
 * Tetromino shapes
 */
const Shapes: Grid[] = [
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
  [[2, 0, 0], [2, 2, 2], [0, 0, 0]], // J
  [[0, 0, 3], [3, 3, 3], [0, 0, 0]], // L
  [[4, 4], [4, 4]], // O
  [[0, 5, 5], [5, 5, 0], [0, 0, 0]], // S
  [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T
  [[7, 7, 0], [0, 7, 7], [0, 0, 0]] // Z
];

/**
 * The spawn coordinates of the Tetrominos (depending on the shape definition)
 */
const ShapeOrigins: any[] = [
  { originX: 3, originY: -1 }, // I
  { originX: 3, originY: 0 }, // J
  { originX: 3, originY: 0 }, // L
  { originX: 4, originY: 0 }, // O
  { originX: 3, originY: 0 }, // S
  { originX: 3, originY: 0 }, // T
  { originX: 3, originY: 0 }, // Z
];

/**
 * Generate a bag of 7 randomly shuffled Tetrominos using the Fisher-Yates algorithm.
 * A bag always contains all the 7 different Tetrominos, though each only once.
 * See: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
 * 
 * @returns {number[]}
 */
function generateTetrominoBag(): number[] {
  const bag = [0, 1, 2, 3, 4, 5, 6];
  for ( let i = bag.length - 1; i > 0; i-- ) {
    const j = Math.floor( Math.random() * ( i + 1 ) );
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

/**
 * Generates an empty Tetris grid
 *
 * @export
 * @returns {Grid}
 */
export function getEmptyGrid(): Grid {
  return Array( 20 ).fill( 0 ).map( _ => Array( 10 ).fill( 0 ) );
}

export function getEmptyTetromino(): Tetromino {
  return { originX: 0, originY: 0, shape: Array( 4 ).fill( 0 ).map( _ => Array( 4 ).fill( 0 ) ) };
}

export function getEmptyState(): State {
  return {
    grid: getEmptyGrid(),
    currentTetromino: getEmptyTetromino(),
    nextTetromino: getEmptyTetromino(),
    level: 1,
    score: 0,
    lines: 0,
    speed: getLevelSpeed( 1 ),
    paused: false,
    over: false
  };
}

export function getInitialState(): State {
  const newState = { ...getEmptyState(),
    currentTetromino: getTetromino(),
    nextTetromino: getNextTetromino(),
  };
  newState.grid = placeTetrominoOnGrid( newState.currentTetromino, newState.grid );
  return newState;
};

export const ClearedLinesScore: number[] = [
  0, 100, 300, 500, 800, 1200, 1500
];

export function getClearedLinesScore( clearedLines: number ): number {
  return ClearedLinesScore[clearedLines];
}
const LevelSpeed = [
  800, 720, 648, 583, 524, 471, 423, 380, 342, 307, 276, 248, 223, 200, 180, 162, 145, 130, 117, 105, 94, 84
];

export function getLevelSpeed( level: number ): number {
  return LevelSpeed[( level > 0 ) ? ( level - 1 ) : 0] ?? 80;
}

const LevelLines = [
  // 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 27, 30, 33, 37, 41, 46, 51, 57, 64, 72, 80
  0, 10, 21, 33, 46, 60, 75, 91, 109, 129, 151, 175, 202, 232, 265, 302, 343, 389, 440, 497, 561, 633, 713, 800
];

export function getLevelFromLines( lines: number ): number {
  return LevelLines.findIndex( ( levellines ) => lines < levellines );
}

/**
 * Retrieve the CSS style name for the given color code as stored in the Tetromino shape
 *
 * @export
 * @param {number} color
 * @returns {string}
 */
export function getTetrominoColorStyle( color: number ): string {
  color -= 1;
  if ( color > 7 || color < 0 ) throw 'wrong color index (must be between 0 and 7)';
  return TetrominoColorStyles[color];
}

/**
 * Integrates the shape of a Tetromino into a grid
 *
 * @export
 * @param {Tetromino} tetromino
 * @param {Grid} grid
 * @returns {Grid}
 */
export function placeTetrominoOnGrid( tetromino: Tetromino, grid: Grid ): Grid {
  const newGrid: Grid = grid.map( row => row.slice() );
  tetromino.shape.map( ( row, rowIndex ) => {
    return row.map( ( cell, columnIndex ) => {
      const cellX = tetromino.originX + columnIndex;
      const cellY = tetromino.originY + rowIndex;
      if ( ( cell > 0 ) && ( cellX <= newGrid[0].length - 1 ) && ( cellY <= newGrid.length - 1 ) ) newGrid[cellY][cellX] = tetromino.shape[rowIndex][columnIndex];
    } );
  } );
  return newGrid;
}

/**
 * Remove the shape of a Tetromino from a grid
 *
 * @export
 * @param {Tetromino} tetromino
 * @param {Grid} grid
 * @returns {Grid}
 */
export function removeTetrominofromGrid( tetromino: Tetromino, grid: Grid ): Grid {
  const newGrid: Grid = grid.map( row => row.slice() );
  tetromino.shape.map( ( row, rowIndex ) => {
    return row.map( ( cell, columnIndex ) => {
      const cellX = tetromino.originX + columnIndex;
      const cellY = tetromino.originY + rowIndex;
      if ( ( cell > 0 ) && ( cellX <= newGrid[0].length - 1 ) && ( cellY <= newGrid.length - 1 ) ) newGrid[cellY][cellX] = 0;
    } );
  } );
  return newGrid;
}

const Bag: number[] = [];
/**
 * Retrieve the index of a new Tetromino to be played with out of the Tetromino bag(s).
 *
 * @returns {number}
 */
function getRandomShapeIndex(): number {
  if ( Bag.length < 2 ) {
    Bag.push( ...generateTetrominoBag() );
  }
  return Bag.shift() || 0;
}

/**
 * Retrieve a randomly generated Tetromino that will become the currently played Tetromino
 *
 * @export
 * @returns {Tetromino}
 */
export function getTetromino(): Tetromino {
  const randomShapeIndex = getRandomShapeIndex();
  return { ...ShapeOrigins[randomShapeIndex], shape: Shapes[randomShapeIndex] };
}

/**
 * Retrive the Tetromino that will come after the currently played Tetromino.
 * This function should be called AFTER retrieving a new Tetromino to be played with (using "getTetromino()")
 *
 * @export
 * @returns {Tetromino}
 */
export function getNextTetromino(): Tetromino {
  const nextShapeIndex = Bag[0];
  return { ...ShapeOrigins[nextShapeIndex], shape: Shapes[nextShapeIndex] };
}

export type State = {
  grid: Grid,
  currentTetromino: Tetromino,
  nextTetromino: Tetromino,
  level: number,
  score: number,
  lines: number,
  speed: number,
  paused: boolean,
  over: boolean
};
