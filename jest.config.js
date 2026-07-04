/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",

  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.ts",
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  testMatch: [
    "**/__tests__/**/*.test.ts?(x)",
    "**/?(*.)+(test|spec).ts?(x)",
  ],

  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|expo-.*|@react-navigation/.*)"
  ],
};