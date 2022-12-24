module.exports = {
  rootDir: './',
  modulePaths: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testRegex: '(\\.|/)(test|spec|e2e-spec)\\.tsx?$',
  testPathIgnorePatterns: [
    '(\\.|/)(contract.test|contract.spec|provider.spec|postman.spec|integration.spec)\\.tsx?$',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
