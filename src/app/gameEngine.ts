import { interval, EMPTY, BehaviorSubject } from 'rxjs';
import { take, distinctUntilChanged, switchMap, windowToggle, filter, flatMap, tap } from 'rxjs/operators';


/**
 * implementation of a game pause
 */
export const pauseSubject$ = new BehaviorSubject(false);
const pause$ = pauseSubject$.pipe( distinctUntilChanged() );

/**
 * implementation of game speed
 */
export const speed$ = new BehaviorSubject( 1000 );
export const loop$ = speed$.pipe(
  switchMap( speed => interval( speed ) )
);

/**
 * Game engine utilizing "switchMap"
 */

export const gameEngine1$ = pause$.pipe(
  switchMap( paused => paused ? EMPTY : loop$ )
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
