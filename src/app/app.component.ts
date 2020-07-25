import { Component } from '@angular/core';

type Grid = number[][];

@Component( {
  selector: 'k11k-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
} )
export class AppComponent {
  title = 'Tetris';
  grid: Grid;
  constructor() {
    this.grid = Array( 20 ).fill( Array( 10 ).fill( 3, 0 ), 0 );
    this.grid = Array( 20 ).fill( 0 ).map( _ => Array( 10 ).fill( 0 ) );


    this.grid[2][2] = 1;
    this.grid[3][2] = 1;
    this.grid[3][3] = 1;
    this.grid[3][4] = 1;
    console.table( this.grid );
  }
}
