import { Component, OnInit } from '@angular/core';
import { getTetrominoColorStyle,  State } from './gameModel';
import { Observable, fromEvent } from 'rxjs';
import { take, pluck, filter, scan } from 'rxjs/operators';

import { pauseSubject$, gameEngine$, emptyGameEngine$ } from './gameEngine';

@Component( {
  selector: 'k11k-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
} )
export class AppComponent implements OnInit {
  title = 'Tetris';
  gameState$: Observable<State>;
  pause$: Observable<boolean>;

  ngOnInit(): void {
    // setTimeout( () => pauseSubject$.next( true ), 4000 );
    // setTimeout( () => pauseSubject$.next( false ), 9000 );
    this.pause$.subscribe( (paused: boolean) => pauseSubject$.next( paused));
  }

  constructor() {
    this.gameState$ = emptyGameEngine$;
    this.pause$ = fromEvent<Event>( document, 'keyup' ).pipe(
      pluck<Event, string>( 'code' ),
      filter( code => code === 'Escape' ) ,
      scan<string, boolean>( (paused: boolean) => !paused, false )
    );
  }

  start() {
    this.gameState$ = gameEngine$.pipe( take( 200 ) );
  }

  getTetrominoColorStyle( color: number ): string {
    return getTetrominoColorStyle( color );
  }
  
}
