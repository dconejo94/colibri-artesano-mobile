import "@testing-library/jest-native/extend-expect";


jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("expo-blur", () => {
  const { View } = require("react-native");
  return { BlurView: View };
});

jest.mock("expo-font", () => ({
  ...jest.requireActual("expo-font"),
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
}));

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock("react-native-gesture-handler", () =>
  require("react-native-gesture-handler/jestSetup")
);

const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("useNativeDriver")) return;
  originalWarn(...args);
};