/** @type {import('jest').Config} */
export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  testPathIgnorePatterns: ["<rootDir>/tests/e2e/"],
  collectCoverageFrom: ["src/js/**/*.js", "!src/js/**/*.min.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
