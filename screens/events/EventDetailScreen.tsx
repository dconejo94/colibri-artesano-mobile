import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, Share, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/auth/authStore";
import { useEventDetail } from "@/src/hooks/useEventDetail";
import { formatEventDateLong, formatEventTime } from "@/src/components/EventCard";
import ErrorBanner from "@/src/components/ErrorBanner";
import Button from "@/components/ui/Button";

const STATUS_LABEL: Record<string, string> = {
  pending: "Solicitud pendiente de revisión",
  approved: "Tu tienda participa en este evento",
  rejected: "Solicitud rechazada",
};

export default function EventDetailScreen() {
  const { colors, radii, text } = useTheme();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const user = useAuthStore((s) => s.user);
  const {
    event,
    myStoreId,
    isLoading,
    isParticipationLoading,
    error,
    refetch,
    requestMyParticipation,
    withdrawMyParticipation,
  } = useEventDetail(eventId);

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorBanner
          error={error ?? { status: 404, message: "Este evento ya no está disponible." }}
          onRetry={refetch}
          variant="centered"
        />
      </SafeAreaView>
    );
  }

  const handleShare = () => {
    Share.share({ message: `${event.title} — ${event.location ?? ""}, ${formatEventDateLong(event.event_date)}` }).catch(() => {});
  };

  const isVendorWithStore = user?.role === "vendor" && !!myStoreId;

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {event.cover_image_url ? (
          <Image source={{ uri: event.cover_image_url }} style={local.cover} />
        ) : (
          <View style={[local.cover, { backgroundColor: colors.primaryDeep }]}>
            <MaterialIcons name="event" size={48} color="rgba(255,255,255,0.85)" />
          </View>
        )}
        <Pressable
          onPress={() => router.back()}
          style={[local.roundBtn, { left: s(14), backgroundColor: "rgba(15,19,15,0.5)" }]}
          accessibilityLabel="Volver"
          accessibilityRole="button"
        >
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Pressable
          onPress={handleShare}
          style={[local.roundBtn, { right: s(14), backgroundColor: "rgba(15,19,15,0.5)" }]}
          accessibilityLabel="Compartir evento"
          accessibilityRole="button"
        >
          <MaterialIcons name="share" size={19} color="#fff" />
        </Pressable>

        <View style={local.content}>
          <Text style={[text.h2, { color: colors.textPrimary }]}>{event.title}</Text>

          <View style={{ gap: vs(13), marginTop: vs(16) }}>
            <InfoRow icon="schedule" label="HORA" value={formatEventTime(event.event_date)} colors={colors} text={text} />
            <InfoRow icon="event" label="FECHA" value={formatEventDateLong(event.event_date)} colors={colors} text={text} />
            {!!event.location && (
              <InfoRow icon="place" label="LUGAR" value={event.location} colors={colors} text={text} />
            )}
          </View>

          {!!event.description && (
            <Text style={[text.body, { color: colors.textSecondary, marginTop: vs(18), lineHeight: ms(21) }]}>
              {event.description}
            </Text>
          )}

          <ErrorBanner error={error} onDismiss={() => {}} />

          <View style={{ marginTop: vs(22) }}>
            <Text style={[text.h3, { color: colors.textPrimary }]}>
              Tiendas participantes ({event.participants.length})
            </Text>
            {event.participants.length === 0 ? (
              <Text style={[text.caption, { color: colors.textMuted, marginTop: vs(8) }]}>
                Todavía ninguna tienda participa en este evento.
              </Text>
            ) : (
              event.participants.map((store) => (
                <Pressable
                  key={store.id}
                  onPress={() => router.push(`/tienda/${store.id}` as any)}
                  style={[local.storeRow, { borderTopColor: colors.border }]}
                >
                  <View style={[local.storeAvatar, { backgroundColor: colors.primary, borderRadius: radii.full }]}>
                    <Text style={{ color: colors.textOnPrimary, fontWeight: "700", fontSize: 13 }}>
                      {store.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[text.body, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                    {store.name}
                  </Text>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {isVendorWithStore && (
        <View style={[local.footer, { borderTopColor: colors.border, backgroundColor: colors.bgPage }]}>
          {event.my_participation && (
            <Text style={[text.caption, { color: colors.textMuted, textAlign: "center", marginBottom: vs(8) }]}>
              {STATUS_LABEL[event.my_participation]}
            </Text>
          )}
          {!event.my_participation ? (
            <Button
              title={isParticipationLoading ? "Enviando..." : "Solicitar participación"}
              onPress={requestMyParticipation}
              disabled={isParticipationLoading}
            />
          ) : (
            <Button
              title={isParticipationLoading ? "Procesando..." : "Retirar solicitud"}
              variant="secondary"
              onPress={withdrawMyParticipation}
              disabled={isParticipationLoading}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
  text,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>["colors"];
  text: ReturnType<typeof useTheme>["text"];
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: s(11) }}>
      <View style={[local.infoIcon, { backgroundColor: colors.primary + "26" }]}>
        <MaterialIcons name={icon} size={19} color={colors.primary} />
      </View>
      <View>
        <Text style={{ fontSize: ms(11), letterSpacing: 0.8, textTransform: "uppercase", color: colors.textMuted }}>
          {label}
        </Text>
        <Text style={[text.body, { color: colors.textPrimary, marginTop: 1 }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  cover: { height: 172, alignItems: "center", justifyContent: "center" },
  roundBtn: { position: "absolute", top: 14, width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  content: { padding: s(16), paddingBottom: vs(28) },
  infoIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  storeRow: { flexDirection: "row", alignItems: "center", gap: s(12), paddingVertical: vs(11), borderTopWidth: 0.5, marginTop: vs(6) },
  storeAvatar: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  footer: { borderTopWidth: 0.5, padding: s(16), paddingBottom: vs(24) },
});
