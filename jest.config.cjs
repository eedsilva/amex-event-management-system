/** @type {import('ts-jest').InitialOptionsTsJest} */
const config = {
  testEnvironment: "node",
  watchman: false,
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
        useESM: false
      }
    ]
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  }
};

module.exports = config;
