import { Stack } from "expo-router";

export default function StoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="products" />
    </Stack>
  );
}
