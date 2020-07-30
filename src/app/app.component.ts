import { Component, OnInit } from '@angular/core';
import { Grid, getEmptyGrid, placeTetrominoOnGrid, Tetromino, removeTetrominofromGrid, getTetrominoColorStyle, getTetromino, getNextTetromino, State } from './gameModel';
import { interval, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { pauseSubject$, speed$, gameEngine$, EmptyGameEngine$ } from './gameEngine';

@Component( {
  selector: 'k11k-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
} )
export class AppComponent implements OnInit {
  title = 'Tetris';
  gameState$: Observable<State>;

  ngOnInit(): void {
    speed$.next( 400 );
    
    // setTimeout( () => speed$.next( 800 ), 2500 );
    // setTimeout( () => pauseSubject$.next( true ), 4000 );
    // setTimeout( () => speed$.next( 500 ), 7000 );
    // setTimeout( () => pauseSubject$.next( false ), 9000 );
  }

  constructor() {
    this.gameState$ = EmptyGameEngine$;
  }

  start() {
    this.gameState$ = gameEngine$.pipe( take( 200 ) );
  }

  getTetrominoColorStyle( color: number ): string {
    return getTetrominoColorStyle( color );
  }
  
}
