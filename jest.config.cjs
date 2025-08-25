/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: { "^.+\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.base.json" }] },
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
  coverageReporters: ["text", "lcov"]
}
