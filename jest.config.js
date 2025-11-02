module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '**/tests/**/*.spec.ts'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/'
  ],
  setupFiles: [
    '<rootDir>/tests/setup.ts'
  ],
};
