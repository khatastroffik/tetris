import { Component } from '@angular/core';
import { Grid, getEmptyGrid, placeTetrominoOnGrid, Tetromino, removeTetrominofromGrid, getTetrominoColorStyle, getTetromino, getNextTetromino } from './gameModel';
import { interval, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { pauseSubject$, gameEngine2$, speed$, gameEngine1$ } from './gameEngine';

@Component( {
  selector: 'k11k-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
} )
export class AppComponent {
  title = 'Tetris';
  grid: Grid;
  T: Tetromino;
  source: Observable<number>;

  constructor() {
    this.grid = getEmptyGrid();
    this.T = { originX: 0, originY: 0, shape: [] };
    this.source = interval( 250 ).pipe( take( 15 ) );
    setTimeout( () => this.testEngine(), 1000);
  }

  getTetrominoColorStyle( color: number ): string {
    return getTetrominoColorStyle( color );
  }

  start() {
    this.grid = removeTetrominofromGrid( this.T, this.grid );
    this.T = getTetromino();
    this.grid = placeTetrominoOnGrid( this.T, this.grid );
    this.source.subscribe( value => {
      this.grid = removeTetrominofromGrid( this.T, this.grid );
      this.T.originY += 1;
      this.grid = placeTetrominoOnGrid( this.T, this.grid );
    } );    
  }

  testEngine(){
    gameEngine1$.pipe(take( 10 )).subscribe(() => console.log( 'GAME ENGINE 1' ));
    gameEngine2$.pipe(take( 10 )).subscribe(() => console.log( 'GAME ENGINE 2' ));
    pauseSubject$.subscribe(paused => console.log('PAUSED: ', paused ) );
    setTimeout( () => speed$.next(800), 2500 );
    setTimeout( () => pauseSubject$.next(true), 4000 );
    setTimeout( () => speed$.next(500), 7000 );
    setTimeout( () => pauseSubject$.next(false), 9000 );
  }
}
