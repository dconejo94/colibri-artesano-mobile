import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithProviders } from "@/components/__tests__/test-utils";
import Button from "@/components/ui/Button";

describe("Button", () => {
  it("renders the title", async () => {
    await renderWithProviders(<Button title="Guardar" onPress={() => {}} />);
    expect(screen.getByText("Guardar")).toBeTruthy();
  });

  it("calls onPress when tapped", async () => {
    const onPress = jest.fn();
    await renderWithProviders(<Button title="Guardar" onPress={onPress} />);
    fireEvent.press(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each(["primary", "secondary", "ghost"] as const)(
    "renders without crashing with variant=%s",
    async (variant) => {
      await renderWithProviders(
        <Button title="Guardar" onPress={() => {}} variant={variant} />
      );
      expect(screen.getByText("Guardar")).toBeTruthy();
    }
  );

  it("renders without crashing with an empty title", async () => {
    await renderWithProviders(<Button title="" onPress={() => {}} />);
    expect(screen.getByRole("button")).toBeTruthy();
  });

  it("does not call onPress when disabled", async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <Button title="Guardar" onPress={onPress} disabled />
    );
    const button = screen.getByRole("button");
    expect(button.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not call onPress and shows loading label when loading", async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <Button title="Guardar" onPress={onPress} loading />
    );
    expect(screen.getByText("Procesando…")).toBeTruthy();
    expect(screen.queryByText("Guardar")).toBeNull();
    const button = screen.getByRole("button");
    expect(button.props.accessibilityState.busy).toBe(true);
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});