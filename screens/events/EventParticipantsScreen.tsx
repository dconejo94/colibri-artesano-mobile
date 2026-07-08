import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { getEvent, listParticipants, reviewParticipation } from "@/api/events";
import { getStore } from "@/api/stores";
import { normalizeError, type ApiError } from "@/src/api/errors";
import ErrorBanner from "@/src/components/ErrorBanner";
import SubHeader from "@/components/ui/SubHeader";
import type { EventParticipant, ParticipationStatus } from "@/types/event";

type Row = EventParticipant & { storeName: string };

export default function EventParticipantsScreen() {
  const { colors, radii, text } = useTheme();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const [eventTitle, setEventTitle] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [event, participants] = await Promise.all([getEvent(eventId), listParticipants(eventId)]);
      setEventTitle(event.title);
      const withNames = await Promise.all(
        participants.map(async (p) => {
          const store = await getStore(p.store_id).catch(() => null);
          return { ...p, storeName: store?.name ?? "Tienda" };
        })
      );
      setRows(withNames);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReview = async (row: Row, status: ParticipationStatus) => {
    if (!eventId) return;
    setReviewingId(row.id);
    try {
      await reviewParticipation(eventId, row.store_id, status);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SubHeader title={eventTitle ? `Solicitudes — ${eventTitle}` : "Solicitudes"} onBack={() => router.back()} />

      {isLoading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && rows.length === 0 ? (
        <ErrorBanner error={error} onRetry={fetchData} variant="centered" />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={local.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={error ? <ErrorBanner error={error} onDismiss={() => setError(null)} /> : null}
          ListEmptyComponent={
            <View style={local.centered}>
              <Text style={[text.body, { color: colors.textSecondary, textAlign: "center" }]}>
                Ninguna tienda ha solicitado participar todavía.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const meta = { pending: colors.warningBg, approved: colors.successBg, rejected: colors.errorBg }[item.status];
            const fg = { pending: colors.warningText, approved: colors.successText, rejected: colors.errorText }[item.status];
            const isBusy = reviewingId === item.id;
            return (
              <View style={[local.row, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg }]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[text.label, { color: colors.textPrimary, fontWeight: "700" }]} numberOfLines={1}>
                    {item.storeName}
                  </Text>
                  <View style={[local.badge, { backgroundColor: meta, borderRadius: radii.full, marginTop: 5 }]}>
                    <Text style={[local.badgeText, { color: fg }]}>
                      {item.status === "pending" ? "PENDIENTE" : item.status === "approved" ? "APROBADA" : "RECHAZADA"}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: s(8) }}>
                  {item.status !== "approved" && (
                    <Pressable
                      onPress={() => handleReview(item, "approved")}
                      disabled={isBusy}
                      style={[local.actionBtn, { borderColor: colors.primary }]}
                      accessibilityLabel="Aprobar"
                    >
                      <MaterialIcons name="check" size={18} color={colors.primary} />
                    </Pressable>
                  )}
                  {item.status !== "rejected" && (
                    <Pressable
                      onPress={() => handleReview(item, "rejected")}
                      disabled={isBusy}
                      style={[local.actionBtn, { borderColor: colors.errorText }]}
                      accessibilityLabel="Rechazar"
                    >
                      <MaterialIcons name="close" size={18} color={colors.errorText} />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
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
  row: { flexDirection: "row", alignItems: "center", gap: s(12), borderWidth: 0.5, padding: s(13) },
  badge: { alignSelf: "flex-start", paddingHorizontal: s(8), paddingVertical: 3 },
  badgeText: { fontSize: ms(9.5), fontWeight: "700", letterSpacing: 0.4 },
  actionBtn: { width: 34, height: 34, borderWidth: 1.5, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});
