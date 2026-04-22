module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json'],
  reporters: [
    ['jest-silent-reporter', { showSkipped: true }],
    ['jest-junit', { outputDirectory: '.', outputName: 'junit.xml' }]
  ],
  testTimeout: 10000
};