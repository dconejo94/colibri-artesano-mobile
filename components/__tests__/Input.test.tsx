import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithProviders } from "@/components/__tests__/test-utils";
import Input from "@/components/ui/Input";

describe("Input", () => {
  it("renders label and placeholder", async () => {
    await renderWithProviders(
      <Input
        label="Correo"
        placeholder="tu@email.com"
        value=""
        onChangeText={() => {}}
      />
    );
    expect(screen.getByText("Correo")).toBeTruthy();
    expect(screen.getByPlaceholderText("tu@email.com")).toBeTruthy();
  });

  it("calls onChangeText when the user types", async () => {
    const onChangeText = jest.fn();
    await renderWithProviders(
      <Input placeholder="Nombre" value="" onChangeText={onChangeText} />
    );
    await fireEvent.changeText(screen.getByPlaceholderText("Nombre"), "Ana");
    expect(onChangeText).toHaveBeenCalledWith("Ana");
  });

  it("renders correctly with an empty value", async () => {
    await renderWithProviders(
      <Input value="" onChangeText={() => {}} placeholder="algo" />
    );
    expect(screen.getByDisplayValue("")).toBeTruthy();
  });

  it("applies multiline layout when multiline is true", async () => {
    await renderWithProviders(
      <Input
        value=""
        onChangeText={() => {}}
        placeholder="comentario"
        multiline
      />
    );
    expect(screen.getByPlaceholderText("comentario").props.multiline).toBe(true);
  });

  it("toggles password visibility when the eye icon is pressed", async () => {
    await renderWithProviders(
        <Input value="secreto" onChangeText={() => {}} placeholder="Contraseña" secureTextEntry />
    );

    expect(screen.getByPlaceholderText("Contraseña").props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByLabelText("Mostrar contraseña"));
    expect(screen.getByPlaceholderText("Contraseña").props.secureTextEntry).toBe(false);

    await fireEvent.press(screen.getByLabelText("Ocultar contraseña"));
    expect(screen.getByPlaceholderText("Contraseña").props.secureTextEntry).toBe(true);
    });

  it("marks the field as non-editable when disabled", async () => {
    await renderWithProviders(
      <Input value="x" onChangeText={() => {}} placeholder="algo" disabled />
    );
    expect(screen.getByPlaceholderText("algo").props.editable).toBe(false);
  });

  it("shows the error message when error is provided", async () => {
    await renderWithProviders(
      <Input
        value=""
        onChangeText={() => {}}
        placeholder="Correo"
        error="Correo inválido"
      />
    );
    expect(screen.getByText("Correo inválido")).toBeTruthy();
  });

  it("reserves the error slot (renders a space) when there is no error", async () => {
    await renderWithProviders(
      <Input value="" onChangeText={() => {}} placeholder="Correo" />
    );
    expect(screen.getByText(" ")).toBeTruthy();
  });
});

it("passes the keyboardType prop to the TextInput", async () => {
  await renderWithProviders(
    <Input
      value=""
      onChangeText={() => {}}
      keyboardType="email-address"
      placeholder="Correo"
    />
  );

  expect(
    screen.getByPlaceholderText("Correo").props.keyboardType
  ).toBe("email-address");
});
