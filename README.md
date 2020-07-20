# Tetris

## project setup

- generate angular application: `npx -p @angular/cli@10 ng new tetris --routing=true --prefix=k11k --strict=true --style=scss`
- replace karma with jest test framework:
  - `npm install jest jest-preset-angular @types/jest ts-jest jest-extended --save-dev`
  - https://www.amadousall.com/how-to-set-up-angular-unit-testing-with-jest/
  - https://github.com/briebug/jest-schematic
  - https://itnext.io/how-to-use-jest-in-angular-aka-make-unit-testing-great-again-e4be2d2e92d1
  - add option `setupFilesAfterEnv: ['jest-extended'],` to `jest.config.js`
  - add `import 'zone.js/dist/zone';` to `src/test.ts`
  - `npm uninstall karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine karma-jasmine-html-reporter jasmine-core jasmine-spec-reporter @types/jasmine @types/jasminewd2`
