import { Text } from "react-native";
import { render } from "@testing-library/react-native";

describe("Smoke Test", () => {
  it("renders a basic React Native component", async () => {
    const screen = await render(<Text>Smoke Test</Text>);

    expect(screen.getByText("Smoke Test")).toBeTruthy();
  });
});