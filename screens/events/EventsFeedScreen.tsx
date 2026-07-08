import { useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/auth/authStore";
import { useEvents } from "@/src/hooks/useEvents";
import ErrorBanner from "@/src/components/ErrorBanner";
import Header from "@/components/ui/Header";
import HamburgerMenu from "@/components/ui/HamburgerMenu";
import EventCard from "@/src/components/EventCard";

export default function EventsFeedScreen() {
  const { colors, radii, text } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { events, isLoading, isLoadingMore, error, hasMore, fetchNextPage, refetch } = useEvents();
  const canManage = !!user?.is_admin;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <Header onMenuPress={() => setMenuOpen(true)} />

      <View style={local.titleRow}>
        <View>
          <Text style={[text.h2, { color: colors.primaryDeep }]}>Eventos</Text>
          <View style={[local.underline, { backgroundColor: colors.accent }]} />
        </View>
        {canManage && (
          <Pressable
            onPress={() => router.push("/eventos/admin" as any)}
            hitSlop={10}
            accessibilityLabel="Gestionar eventos"
            accessibilityRole="button"
            style={[local.manageBtn, { backgroundColor: colors.bgSection, borderRadius: radii.full }]}
          >
            <MaterialIcons name="tune" size={20} color={colors.primary} />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && events.length === 0 ? (
        <ErrorBanner error={error} onRetry={refetch} variant="centered" />
      ) : events.length === 0 ? (
        <View style={local.centered}>
          <View style={[local.emptyIcon, { backgroundColor: colors.bgSection, borderRadius: radii.full }]}>
            <MaterialIcons name="event" size={ms(40)} color={colors.primarySoft} />
          </View>
          <Text style={[text.body, { color: colors.textSecondary, textAlign: "center", marginTop: vs(12) }]}>
            No hay eventos programados por ahora.
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={local.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            error ? <ErrorBanner error={error} onRetry={() => fetchNextPage()} onDismiss={() => {}} /> : null
          }
          onEndReached={() => {
            if (hasMore) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? <ActivityIndicator style={{ paddingVertical: vs(16) }} color={colors.primary} /> : null
          }
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => router.push(`/eventos/${item.id}` as any)} />
          )}
        />
      )}

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: s(16),
    paddingTop: vs(16),
    paddingBottom: vs(4),
  },
  underline: { height: 3, width: 34, borderRadius: 2, marginTop: 7 },
  manageBtn: { width: ms(36), height: ms(36), alignItems: "center", justifyContent: "center" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: s(32) },
  emptyIcon: { width: ms(80), height: ms(80), alignItems: "center", justifyContent: "center" },
  list: { padding: s(16), gap: vs(14) },
});
