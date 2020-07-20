describe('When Angular starting page is loaded', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('has app title', () => {
    cy.title().should('contain', 'Tetris');
  });
});
