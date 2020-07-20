# Tetris

## project setup

- generate angular v10 application:
`npx -p @angular/cli@10 ng new tetris --routing=true --prefix=k11k --strict=true --style=scss`
- replace karma with jest test framework:
  - install dependencies:
  `npm install jest jest-preset-angular @types/jest ts-jest jest-extended --save-dev`
  - see: [how-to-set-up-angular-unit-testing-with-jest](https://www.amadousall.com/how-to-set-up-angular-unit-testing-with-jest/)
  - see: [How to use Jest in Angular](https://itnext.io/how-to-use-jest-in-angular-aka-make-unit-testing-great-again-e4be2d2e92d1)
  - add option `setupFilesAfterEnv: ['jest-extended'],` to `jest.config.js`
  - add `import 'zone.js/dist/zone';` to `src/test.ts`
  - uninstall karma:
  `npm uninstall karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine karma-jasmine-html-reporter jasmine-core jasmine-spec-reporter @types/jasmine @types/jasminewd2`
  - see also: [briebug/jest-schematic](https://github.com/briebug/jest-schematic) (not working with angular 10 at the moment)
- replace protractor with cypress e2e test framework:
  - see: [CI ready e2e tests for Angular with Cypress and TypeScript in under 60 minutes](https://dev.to/angular/ci-ready-e2e-tests-for-angular-with-cypress-and-typescript-in-under-60-minutes-4f30)
  - see: [Switching to Cypress from Protractor in Less Than 30 Seconds](https://medium.com/briebug-blog/switching-to-cypress-from-protractor-in-less-than-30-seconds-b60b00def4a0)
  - see: [Adding Cypress UI Tests to Your DevOps Pipeline](https://www.cypress.io/blog/2019/08/02/guest-post-angular-adding-cypress-ui-tests-to-your-devops-pipeline)
  - see: [cypress-and-jest-typescript-example](https://github.com/cypress-io/cypress-and-jest-typescript-example)
