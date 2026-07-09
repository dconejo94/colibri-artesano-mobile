import { Stack } from "expo-router";

export default function EventosLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[eventId]" />
      <Stack.Screen name="map" />
      <Stack.Screen name="admin/index" />
      <Stack.Screen name="admin/[eventId]/index" />
      <Stack.Screen name="admin/[eventId]/solicitudes" />
    </Stack>
  );
}
