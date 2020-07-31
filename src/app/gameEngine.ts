import { interval, EMPTY, BehaviorSubject, Observable, of, combineLatest, fromEvent, noop, merge } from 'rxjs';
import { take, distinctUntilChanged, switchMap, windowToggle, filter, flatMap, tap, scan, mapTo, startWith, pluck, map, share, repeat, repeatWhen } from 'rxjs/operators';
import { State, Grid, Tetromino, getEmptyGrid, getTetromino, getNextTetromino, placeTetrominoOnGrid, removeTetrominofromGrid, GameKeys, ClearedLinesScore, getLevelSpeed, getLevelFromLines, getClearedLinesScore, getEmptyTetromino, getEmptyState, getInitialState } from './gameModel'

/**
 * implementation of a game pause related observables
 */

export const pauseSubject$ = new BehaviorSubject( false );
const pause$ = pauseSubject$.pipe(
  startWith( false ),
  distinctUntilChanged(),
  map( paused => { return { action: 'PAUSE', value: paused } } )
);

/**
 * implementation of game speed and game loop related observables
 */

export const speed$ = new BehaviorSubject( getLevelSpeed( 1 ) );
export const loop$ = speed$.pipe(
  switchMap( speed => interval( speed ) )
);

const gameLoop$ = pause$.pipe(
  switchMap( action => action.value ? EMPTY : loop$ ),
  map( loop => { return { action: 'LOOP', value: 1 } } )
);


/**
 * implementation of game input related observables
 */

const keyboardIinput$ = fromEvent<Event>( document, 'keyup' );

const gameInput$ = pause$.pipe(
  switchMap( action => action.value ? EMPTY : keyboardIinput$ ),
  pluck<Event, string>( 'code' ),
  filter( code => GameKeys.includes( code ) ),
  map( code => { return { action: 'KEYUP', value: code } } )
);

/**
 * implementation of game engine related observables
 */

type GameEvent = {
  action: string;
  value: any;
}

export const emptyGameEngine$ = of( getEmptyState() );

export const gameEngine$ = merge( gameLoop$, gameInput$, pause$ ).pipe(
  scan<GameEvent, State>( ( gameState, gameEvent ) => {
    gameState.grid = removeTetrominofromGrid( gameState.currentTetromino, gameState.grid );
    switch ( gameEvent.action ) {
      case "PAUSE":
        gameState.paused = gameEvent.value;
        break;
      case "LOOP":
        drop( gameState );
        break;
      case "KEYUP":
        move( gameEvent.value, gameState );
        break;
      default:
        break;
    }
    clearLines( gameState );
    gameState.grid = placeTetrominoOnGrid( gameState.currentTetromino, gameState.grid );
    return gameState;
  },
    getInitialState()
  ),
)

/**
 * implementation of game engine related helper functions
 */

function updateSpeed( gameState: State ): number {
  let newSpeed = getLevelSpeed( gameState.level );
  if ( newSpeed != gameState.speed ) speed$.next( newSpeed );
  return newSpeed;
}

function clearLines( gameState: State ): void {
  let clearedLines = 0;
  gameState.grid.forEach( ( row, rowIndex ) => {
    if ( row.every( cell => cell > 0 ) ) {
      gameState.grid.splice( rowIndex, 1 );
      gameState.grid.unshift( Array( 10 ).fill( 0 ) );
      clearedLines += 1;
    }
  } );
  gameState.score += getClearedLinesScore( clearedLines );
  gameState.lines += clearedLines;
  gameState.level = getLevelFromLines( gameState.lines );
  gameState.speed = updateSpeed( gameState );
}

function drop( gameState: State, toBottom = false ): void {
  let dropped = false;
  do {
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
      // this tetromino is 'done' and should be fixed on the game grid
      gameState.grid = placeTetrominoOnGrid( gameState.currentTetromino, gameState.grid );
      gameState.currentTetromino = getTetromino();
      gameState.nextTetromino = getNextTetromino();
      dropped = false;
    }
    gameState.score += dropped ? 1 : 0;
  } while ( toBottom && dropped );
}

function rotateShape( shape: number[][] ): number[][] {
  return shape[0].map( ( val, index ) => shape.map( row => row[index] ).reverse() );
}

function move( move: string, gameState: State ): boolean {
  switch ( move ) {
    case 'ArrowLeft':
      if ( gameState.currentTetromino.shape.every( ( row ) => row.every( ( cell, columnIndex ) => ( cell === 0 ) || ( gameState.currentTetromino.originX + columnIndex > 0 ) ) ) ) gameState.currentTetromino.originX -= 1;
      break;
    case 'ArrowRight':
      if ( gameState.currentTetromino.shape.every( ( row ) => row.every( ( cell, columnIndex ) => ( cell === 0 ) || ( gameState.currentTetromino.originX + columnIndex < 9 ) ) ) ) gameState.currentTetromino.originX += 1;
      break;
    case 'Space':
      drop( gameState, true );
      break;
    case 'ArrowUp':
      gameState.currentTetromino.shape = rotateShape( gameState.currentTetromino.shape );
      break;
    case 'ArrowDown':
      drop( gameState );
      break;
    default:
      break;
  }
  return true;
}
