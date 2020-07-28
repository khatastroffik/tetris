import { interval, EMPTY, BehaviorSubject, Observable, of, combineLatest, fromEvent, noop } from 'rxjs';
import { take, distinctUntilChanged, switchMap, windowToggle, filter, flatMap, tap, scan, mapTo, startWith, pluck, map } from 'rxjs/operators';
import { State, Grid, Tetromino, getEmptyGrid } from './gameModel'
import { flatten } from '@angular/compiler';

/**
 * implementation of a game pause
 */
export const pauseSubject$ = new BehaviorSubject( false );
const pause$ = pauseSubject$.pipe( distinctUntilChanged() );

/**
 * implementation of game speed
 */
export const speed$ = new BehaviorSubject( 1000 );
export const loop$ = speed$.pipe(
  switchMap( speed => interval( speed ) )
);


const initialState: State = {
  grid: getEmptyGrid(),
  currentTetromino: undefined,
  nextTetromino: undefined,
  level: 1,
  score: 0,
  lines: 0,
  speed: 1000,
  paused: false,
  over: false,
  loop: -1
};

const gameState$: Observable<State> = of( initialState );

/**
 * Game loop utilizing "switchMap". The loop count is globally persisted!
 */
export const gameEngine1$ = pause$.pipe(
  switchMap( paused => paused ? EMPTY : loop$ ),
  scan<number, number>( ( loops, _ ) => loops += 1, -1 )
);

/**
 * Game engine utilizing "windowToggle"
 */
const on$ = pause$.pipe( filter( paused => paused === true ) );
const off$ = pause$.pipe( filter( paused => !paused ) );
export const gameEngine2$ = loop$.pipe(
  windowToggle( off$, () => on$ ),
  flatMap( values => values )
);

export const gameLoop$ = pause$.pipe(
  switchMap( paused => paused ? EMPTY : loop$ ),
  scan<number, number>( ( loops, _ ) => loops += 1, -1 ),
  take(10)
);

export const gameInput$ = fromEvent<Event>(document, 'keyup').pipe(
  startWith( {code: undefined} ),
  pluck<Event | {code: undefined}, string>('code')
);

export const gameEngine$ = combineLatest( gameLoop$, gameInput$ ).pipe(
  scan<[number, string], State>( ( state, [currentLoop, currentKeycode] ) => {
    if ( state.loop != currentLoop ) {
      state.loop = currentLoop;
      console.log('LOOP = ', currentLoop);
    } else {
      console.log('KEY = ', currentKeycode);
    }
    return state;
  },
  initialState
  ),
)
// export const gameEngine$ = combineLatest( gameLoop$, gameState$ ).pipe(
//   tap( ( [num, _] ) => console.log( 'loop=', num) ),

//   scan<[number, State], State>( ( state, [currentNumber, currentState] ) => {
//     if (state === undefined) state = currentState;
//     if ( state.loop != currentNumber ) state.loop = currentNumber;
//     console.log('NEW STATE: ', state.loop);
//     return state;
//   },
//   initialState
//   ),
//   tap( ( st ) => console.log( 'combined state.loop', st.loop ) ),
// )

// export const gameEngine$ = combineLatest( gameEngine1$, gameState$ ).pipe(
//   tap( ( [num, st] ) => console.log( 'loop=', num, ' state.loop= ', st.loop ) ),

//   scan<[number, State], State>( ( state, [currentNumber, currentState] ) => (
//     ( state.loop != currentNumber ) && ( state.loop = currentNumber ), 
//     state
//   ),
//     initialState
//   ),
//   tap( ( st ) => console.log( 'combined state.loop', st.loop ) ),
// )


export interface State2 {
  game: number[][];
  x: number;
  y: number;
  score: number;
}

export interface Key {
  code: string;
}

export type Brick = number[][];

const player$ = combineLatest(
  of( [[1, 1, 1], [1, 1, 1]] ),
  of( { code: '' } ),
  fromEvent( document, 'keyup' ).pipe(
    startWith( { code: undefined } ),
    pluck( 'code' )
  )
).pipe(
  map(
    ( [brick, key, keyCode]: [Brick, Key, unknown] ) => (
      ( key.code = <string>keyCode ), [brick, key]
    )
  )
);

const state$ = interval( 1000 ).pipe(
  scan<number, State2>( ( state, _ ) => ( state.score++, state ), { game: [[1]], x: 0, y: 0, score: 0 } )
  // scan<number, State2>( ( state, _ ) => ( state.score++, state ), {game: [[1]], x:0, y:0, score:0} )
);

let state;
let brick;

const ROTAT = ( [newState, rotatedBrick]: [State2, Brick] ) => { ( state = newState ); ( brick = rotatedBrick ) };
const COLLI = ( [newState, collidedBrick]: [State2, Brick] ) => { ( state = newState ); ( brick = collidedBrick ) };

const game$ = combineLatest( state$, player$ ).pipe(
  // scan<[State, [Brick, Key]], [State, [Brick, Key]]>(
  scan(
    ( [state, [brick, key]] ) => (
      state = state,
      ROTAT( [state, <Brick>brick] ),
      COLLI( [state, <Brick>brick] ),
      state = state,
      key = key,
      [state, [brick, key]]
    ) ),
);
