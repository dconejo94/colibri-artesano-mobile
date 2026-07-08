import { View, Text, ScrollView, ActivityIndicator, Share, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { useVendorProfile } from "@/src/hooks/useVendorProfile";
import ErrorBanner from "@/src/components/ErrorBanner";
import FollowButton from "@/src/components/FollowButton";
import ProductCard from "@/src/components/ProductCard";
import SubHeader from "@/components/ui/SubHeader";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function VendorProfileScreen() {
  const { colors, radii, shadows, text } = useTheme();
  const router = useRouter();
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const { profile, products, isLoading, isFollowLoading, error, refetch, toggleFollow } =
    useVendorProfile(storeId);

  const handleShare = () => {
    if (!profile) return;
    Share.share({ message: `Mira la tienda "${profile.name}" en Colibrí Artesano` }).catch(() => {});
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SubHeader
        title={profile?.name ?? "Tienda"}
        onBack={() => router.back()}
        rightSlot={
          profile ? (
            <Pressable onPress={handleShare} hitSlop={10} accessibilityLabel="Compartir tienda" accessibilityRole="button">
              <MaterialIcons name="share" size={ms(22)} color={colors.primary} />
            </Pressable>
          ) : undefined
        }
      />

      {isLoading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && !profile ? (
        <ErrorBanner error={error} onRetry={refetch} variant="centered" />
      ) : profile ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={local.content}>
          {/* ── Encabezado de la tienda ── */}
          <View style={local.headerRow}>
            <View style={[local.avatar, { backgroundColor: colors.primaryDeep, borderRadius: radii.lg }]}>
              <Text style={[text.h2, { color: colors.textOnPrimary }]}>{getInitials(profile.name)}</Text>
            </View>
            <View style={local.headerInfo}>
              <Text style={[text.h2, { color: colors.textPrimary }]} numberOfLines={2}>
                {profile.name}
              </Text>
              <Text style={[text.caption, { color: colors.textSecondary, marginTop: 3 }]}>
                {profile.follower_count.toLocaleString("es-CR")}{" "}
                {profile.follower_count === 1 ? "seguidor" : "seguidores"} · {profile.product_count}{" "}
                {profile.product_count === 1 ? "producto" : "productos"}
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: s(16) }}>
            <FollowButton
              isFollowing={profile.is_following}
              isLoading={isFollowLoading}
              onPress={toggleFollow}
            />
          </View>

          {!!profile.description && (
            <View style={local.section}>
              <Text style={[local.sectionLabel, { color: colors.textMuted }]}>SOBRE LA TIENDA</Text>
              <Text style={[text.body, { color: colors.textSecondary, lineHeight: ms(20) }]}>
                {profile.description}
              </Text>
            </View>
          )}

          {/* Mutación de follow fallida: no tapa el contenido ya cargado. */}
          <View style={{ paddingHorizontal: s(16) }}>
            <ErrorBanner error={error} onDismiss={() => {}} />
          </View>

          <View style={[local.section, { paddingHorizontal: 0 }]}>
            <Text style={[local.sectionLabel, { color: colors.textMuted, paddingHorizontal: s(16) }]}>
              PRODUCTOS DE LA TIENDA
            </Text>
            {products.length === 0 ? (
              <View style={[local.emptyRow, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.sm }]}>
                <Text style={[text.body, { color: colors.textSecondary, textAlign: "center" }]}>
                  Esta tienda aún no tiene productos publicados.
                </Text>
              </View>
            ) : (
              // .map() en vez de <ProductList> (FlatList) — anidar un FlatList
              // dentro de este ScrollView rompería el scroll.
              <View style={{ paddingHorizontal: s(16), gap: vs(12) }}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={(id) => router.push(`/producto/${id}` as any)}
                    onObtain={(id) => router.push(`/producto/${id}` as any)}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { paddingBottom: vs(32), gap: vs(18) },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(14),
    paddingHorizontal: s(16),
    paddingTop: vs(16),
  },
  avatar: { width: ms(64), height: ms(64), alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerInfo: { flex: 1, minWidth: 0 },
  section: { paddingHorizontal: s(16), gap: vs(8) },
  sectionLabel: { fontSize: ms(11), fontWeight: "500", letterSpacing: 1.1, textTransform: "uppercase" },
  emptyRow: { marginHorizontal: s(16), padding: s(20), borderWidth: 0.5, alignItems: "center" },
});
