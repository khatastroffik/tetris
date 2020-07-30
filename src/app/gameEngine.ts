import { interval, EMPTY, BehaviorSubject, Observable, of, combineLatest, fromEvent, noop, merge } from 'rxjs';
import { take, distinctUntilChanged, switchMap, windowToggle, filter, flatMap, tap, scan, mapTo, startWith, pluck, map, share, repeat, repeatWhen } from 'rxjs/operators';
import { State, Grid, Tetromino, getEmptyGrid, getTetromino, getNextTetromino, placeTetrominoOnGrid, removeTetrominofromGrid, GameKeys } from './gameModel'

const EmptyTetromino: Tetromino = { originX: 0, originY: 0, shape: Array( 4 ).fill( 0 ).map( _ => Array( 4 ).fill( 0 ) ) };

const EmptyState: State = {
  grid: getEmptyGrid(),
  currentTetromino: EmptyTetromino,
  nextTetromino: EmptyTetromino,
  level: 1,
  score: 0,
  lines: 0,
  speed: 1000,
  paused: false,
  over: false,
  loop: -1
};

export const EmptyGameEngine$ = of( EmptyState );

function initialState(): State {
  const newState = {
    grid: getEmptyGrid(),
    currentTetromino: getTetromino(),
    nextTetromino: getNextTetromino(),
    level: 1,
    score: 0,
    lines: 0,
    speed: 1000,
    paused: false,
    over: false,
    loop: -1
  };
  newState.grid = placeTetrominoOnGrid( newState.currentTetromino, newState.grid );
  return newState;
};

/**
 * implementation of a game pause
 */
export const pauseSubject$ = new BehaviorSubject( false );
const pause$ = pauseSubject$.pipe(
  startWith( false ),
  distinctUntilChanged(),
  map( paused => { return { action: 'PAUSE', value: paused } } )
);

/**
 * implementation of game speed
 */
export const speed$ = new BehaviorSubject( 1000 );
export const loop$ = speed$.pipe(
  switchMap( speed => interval( speed ) )
);

const gameLoop$ = pause$.pipe(
  switchMap( action => action.value ? EMPTY : loop$ ),
  scan<number, number>( ( loops, _ ) => loops += 1, -1 ),
  map( loop => { return { action: 'LOOP', value: loop } } )
);

const keyboardIinput$ = fromEvent<Event>( document, 'keyup' );

const gameInput$ = pause$.pipe(
  switchMap( action => action.value ? EMPTY : keyboardIinput$ ),
  pluck<Event, string>( 'code' ),
  filter(code => GameKeys.includes(code)),
  map( code => { return { action: 'KEYUP', value: code } } )
);

type GameEvent = {
  action: string;
  value: any;
}

export const gameEngine$ = merge( gameLoop$, gameInput$, pause$ ).pipe(
  scan<GameEvent, State>( ( gameState, gameEvent ) => {
    switch ( gameEvent.action ) {
      case "PAUSE":
        // console.log( 'PAUSE: ', gameEvent.value );
        gameState.paused = gameEvent.value;
        break;
      case "LOOP":
        // console.log( 'LOOP: ', gameEvent.value );
        drop( gameState );
        gameState.score += 1;
        gameState.loop = gameEvent.value;
        break;
      case "KEYUP":
        // console.log( 'KEYUP: ', gameEvent.value );
        move( gameEvent.value, gameState );
        break;
      default:
        break;
    }
    return gameState;
  },
    initialState()
  ),
)

function drop( gameState: State, toBottom = false ): boolean {
  let dropped = false;
  gameState.grid = removeTetrominofromGrid( gameState.currentTetromino, gameState.grid );
  if ( gameState.currentTetromino.shape.every( ( row, rowIndex ) => row.every( ( cell, columnIndex ) =>
    ( cell === 0 ) ||
    (
      ( gameState.currentTetromino.originY + rowIndex < 19 ) &&
      ( gameState.grid[gameState.currentTetromino.originY + rowIndex + 1][gameState.currentTetromino.originX + columnIndex] === 0 )
    )
  ) ) ) {
    gameState.currentTetromino.originY += 1;
    dropped = true;
  } else {
    gameState.grid = placeTetrominoOnGrid( gameState.currentTetromino, gameState.grid );
    gameState.currentTetromino = getTetromino();
    gameState.nextTetromino = getNextTetromino();
  }
  gameState.grid = placeTetrominoOnGrid( gameState.currentTetromino, gameState.grid );
  return dropped;
}

function rotateRight( shape: number[][] ): number[][] {
  return shape[0].map( ( val, index ) => shape.map( row => row[index] ).reverse() );
}

function rotateLeft( shape: number[][] ): number[][] {
  return shape[0].map( ( val, index ) => shape.map( row => row[index] ) ).reverse();
}

function move( move: string, gameState: State ): boolean {
  gameState.grid = removeTetrominofromGrid( gameState.currentTetromino, gameState.grid );
  switch ( move ) {
    case 'ArrowLeft':
      if ( gameState.currentTetromino.shape.every( ( row ) => row.every( ( cell, columnIndex ) => ( cell === 0 ) || ( gameState.currentTetromino.originX + columnIndex > 0 ) ) ) ) gameState.currentTetromino.originX -= 1;
      break;
    case 'ArrowRight':
      if ( gameState.currentTetromino.shape.every( ( row ) => row.every( ( cell, columnIndex ) => ( cell === 0 ) || ( gameState.currentTetromino.originX + columnIndex < 9 ) ) ) ) gameState.currentTetromino.originX += 1;
      break;
    case 'Space':
      while ( drop( gameState ) ) {
        gameState.score += 1;
      }
      break;
    case 'ArrowUp':
      gameState.currentTetromino.shape = rotateRight(gameState.currentTetromino.shape);
      break;
      case 'ArrowDown':
        gameState.currentTetromino.shape = rotateLeft(gameState.currentTetromino.shape);
      break;
    default:
      break;
  }
  gameState.grid = placeTetrominoOnGrid( gameState.currentTetromino, gameState.grid );
  return true;
}
