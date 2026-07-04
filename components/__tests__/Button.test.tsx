import { fireEvent } from "@testing-library/react-native";

import Button from "@/components/ui/Button";
import { renderWithProviders } from "@/components/__tests__/test-utils";

describe("Button", () => {
    it("renders the title", async () => {
        const screen = await renderWithProviders(
            <Button title="Continuar" onPress={jest.fn()} />
        );

        expect(screen.getByText("Continuar")).toBeTruthy();
    });

  it("calls onPress when pressed", async () => {
  const onPress = jest.fn();

  const screen = await renderWithProviders(
    <Button title="Continuar" onPress={onPress} />
  );

  fireEvent.press(screen.getByRole("button"));

  expect(onPress).toHaveBeenCalledTimes(1);
});

});