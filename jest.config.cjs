/** @type {import('jest').Config} */
const useDb = process.env.RUN_DB_TESTS === 'true';

module.exports = {
  testEnvironment: "node",
  transform: { "^.+\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.base.json" }] },
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
  coverageReporters: ["text", "lcov"],
  ...(useDb
    ? {
        globalSetup: "<rootDir>/tests/jest.global-setup.cjs",
        globalTeardown: "<rootDir>/tests/jest.global-teardown.cjs",
      }
    : {}),
}
