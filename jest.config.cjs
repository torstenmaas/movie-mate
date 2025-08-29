/** @type {import('jest').Config} */
const useDb = process.env.RUN_DB_TESTS === 'true'

module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.base.json' }] },
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'apps/**/*.{ts,tsx}',
    'packages/**/*.{ts,tsx}',
    '!**/*.spec.ts',
    '!**/__tests__/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'apps/api/src/main.ts',
    'apps/api/src/app.module.ts',
    'apps/api/src/.*/dto/.*.ts',
    'apps/api/src/.*.swagger.ts',
    'packages/@infra/prisma/client/.*',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  ...(useDb
    ? {
        globalSetup: '<rootDir>/tests/jest.global-setup.cjs',
        globalTeardown: '<rootDir>/tests/jest.global-teardown.cjs',
      }
    : {}),
}
