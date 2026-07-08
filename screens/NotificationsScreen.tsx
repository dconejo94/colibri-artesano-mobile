import { View, Text, FlatList, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { useNotifications } from "@/src/hooks/useNotifications";
import ErrorBanner from "@/src/components/ErrorBanner";
import NotificationRow from "@/src/components/NotificationRow";
import SubHeader from "@/components/ui/SubHeader";
import type { Notification } from "@/types/notification";

export default function NotificationsScreen() {
  const { colors, radii, text } = useTheme();
  const router = useRouter();
  const {
    notifications,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    fetchNextPage,
    refetch,
    markRead,
    markAllRead,
  } = useNotifications();

  const hasUnread = notifications.some((n) => !n.is_read);

  const handleOpen = (notification: Notification) => {
    markRead(notification);
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SubHeader
        title="Notificaciones"
        onBack={() => router.back()}
        rightSlot={
          hasUnread ? (
            <Pressable onPress={markAllRead} hitSlop={8} accessibilityRole="button">
              <Text style={[text.caption, { color: colors.primary, fontWeight: "700" }]}>Marcar leído</Text>
            </Pressable>
          ) : undefined
        }
      />

      {isLoading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && notifications.length === 0 ? (
        <ErrorBanner error={error} onRetry={refetch} variant="centered" />
      ) : notifications.length === 0 ? (
        <View style={local.centered}>
          <View style={[local.emptyIcon, { backgroundColor: colors.bgSection, borderRadius: radii.full }]}>
            <MaterialIcons name="notifications-none" size={ms(40)} color={colors.primarySoft} />
          </View>
          <Text style={[text.body, { color: colors.textSecondary, textAlign: "center", marginTop: vs(12) }]}>
            No tienes notificaciones todavía.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={local.list}
          ListHeaderComponent={
            error ? <ErrorBanner error={error} onRetry={() => fetchNextPage()} onDismiss={() => {}} /> : null
          }
          renderItem={({ item }) => (
            <NotificationRow notification={item} onPress={() => handleOpen(item)} />
          )}
          onEndReached={() => {
            if (hasMore) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? <ActivityIndicator style={{ paddingVertical: vs(16) }} color={colors.primary} /> : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: s(32) },
  emptyIcon: { width: ms(80), height: ms(80), alignItems: "center", justifyContent: "center" },
  list: { padding: s(12), gap: vs(2) },
});
