import { View, Text, FlatList, Pressable, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/auth/authStore";
import { useEvents } from "@/src/hooks/useEvents";
import { deleteEvent } from "@/api/events";
import { normalizeError } from "@/src/api/errors";
import { formatEventDate, formatEventTime } from "@/src/components/EventCard";
import ErrorBanner from "@/src/components/ErrorBanner";
import SubHeader from "@/components/ui/SubHeader";
import Button from "@/components/ui/Button";
import type { EventItem } from "@/types/event";

export default function EventsAdminScreen() {
  const { colors, radii, text } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canManage = !!user?.is_admin;
  const { events, isLoading, error, refetch } = useEvents({ limit: 50 });

  if (!canManage) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <SubHeader title="Gestionar eventos" onBack={() => router.back()} />
        <View style={local.centered}>
          <Text style={[text.body, { color: colors.textSecondary, textAlign: "center" }]}>
            Solo los administradores pueden gestionar eventos.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = (event: EventItem) => {
    Alert.alert("Eliminar evento", `¿Eliminar "${event.title}"? Esta acción no se puede deshacer.`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent(event.id);
            refetch();
          } catch (err) {
            Alert.alert("Error", normalizeError(err).message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SubHeader title="Gestionar eventos" onBack={() => router.back()} />

      {isLoading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && events.length === 0 ? (
        <ErrorBanner error={error} onRetry={refetch} variant="centered" />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={local.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={local.centered}>
              <Text style={[text.body, { color: colors.textSecondary, textAlign: "center" }]}>
                No hay eventos creados todavía.
              </Text>
            </View>
          }
          ListFooterComponent={
            <Button title="Crear evento" onPress={() => router.push("/eventos/admin/nuevo" as any)} />
          }
          renderItem={({ item }) => (
            <View style={[local.card, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg }]}>
              <Pressable onPress={() => router.push(`/eventos/${item.id}` as any)} style={local.cardHeader}>
                <View style={[local.icon, { backgroundColor: colors.primaryDeep, borderRadius: radii.md }]}>
                  <MaterialIcons name="event" size={20} color="rgba(255,255,255,0.9)" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[text.label, { color: colors.textPrimary, fontWeight: "700" }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[text.caption, { color: colors.primaryDeep, marginTop: 4 }]}>
                    {formatEventDate(item.event_date)} · {formatEventTime(item.event_date)}
                  </Text>
                  <Text style={[text.caption, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={1}>
                    {item.participants.length} {item.participants.length === 1 ? "tienda aprobada" : "tiendas aprobadas"}
                    {!!item.location && ` · ${item.location}`}
                  </Text>
                </View>
              </Pressable>

              <View style={[local.actionsRow, { borderTopColor: colors.border }]}>
                <Pressable
                  onPress={() => router.push(`/eventos/admin/${item.id}/solicitudes` as any)}
                  style={[local.reviewBtn, { borderColor: colors.border, borderRadius: radii.sm }]}
                >
                  <MaterialIcons name="fact-check" size={15} color={colors.primary} />
                  <Text style={[text.caption, { color: colors.primary, fontWeight: "700" }]}>Solicitudes</Text>
                </Pressable>
                <View style={{ flex: 1 }} />
                <Pressable onPress={() => router.push(`/eventos/admin/${item.id}` as any)} hitSlop={8} accessibilityLabel="Editar evento">
                  <MaterialIcons name="edit" size={18} color={colors.textMuted} />
                </Pressable>
                <Pressable onPress={() => handleDelete(item)} hitSlop={8} accessibilityLabel="Eliminar evento">
                  <MaterialIcons name="delete-outline" size={19} color={colors.errorText} />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: s(24) },
  list: { padding: s(16), gap: vs(12) },
  card: { borderWidth: 0.5, padding: s(13) },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: s(12) },
  icon: { width: ms(46), height: ms(46), alignItems: "center", justifyContent: "center", flexShrink: 0 },
  actionsRow: { flexDirection: "row", alignItems: "center", gap: s(14), marginTop: vs(12), paddingTop: vs(11), borderTopWidth: 0.5 },
  reviewBtn: { flexDirection: "row", alignItems: "center", gap: s(6), borderWidth: 1, paddingHorizontal: s(10), paddingVertical: vs(6) },
});
