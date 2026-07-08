import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, FlatList, Pressable, Image, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { formatPrice } from "@/utils/format";
import { useTheme } from "@/src/theme";
import { useSearch } from "@/src/hooks/useSearch";
import { getCategories } from "@/api/categories";
import type { Category, Product } from "@/types/store";
import { resolveProductImage } from "@/utils/resolveProductImage";

const MAX_RECENT = 6;

export default function SearchScreen() {
  const { colors, radii, text } = useTheme();
  const router = useRouter();
  const { query, setQuery, suggestions, results, isSearching, hasQuery, noResults } = useSearch();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.items))
      .catch(() => {});
  }, []);

  const commitSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    setQuery(trimmed);
    if (!trimmed) return;
    setRecentSearches((prev) => [trimmed, ...prev.filter((r) => r.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT));
  }, [setQuery]);

  const goToProduct = (id: string) => router.push(`/producto/${id}` as any);
  const goToStore = (storeId: string) => router.push(`/tienda/${storeId}` as any);

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[local.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Volver" accessibilityRole="button">
          <MaterialIcons name="arrow-back" size={ms(24)} color={colors.textPrimary} />
        </Pressable>
        <View style={[local.inputWrap, { backgroundColor: colors.bgSection, borderRadius: radii.md }]}>
          <MaterialIcons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => commitSearch(query)}
            placeholder="Buscar productos artesanales…"
            placeholderTextColor={colors.textMuted}
            autoFocus
            style={[local.input, { color: colors.textPrimary }]}
            returnKeyType="search"
          />
          {isSearching && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      </View>

      <FlatList
        data={hasQuery ? results : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={local.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: vs(18) }}>
            {hasQuery && suggestions.length > 0 && (
              <View style={[local.suggestionsBox, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg }]}>
                {suggestions.map((sug) => (
                  <Pressable
                    key={sug.id}
                    style={[local.suggestionRow, { borderTopColor: colors.border }]}
                    onPress={() => commitSearch(sug.name)}
                  >
                    <MaterialIcons name="inventory-2" size={18} color={colors.textMuted} />
                    <Text style={[text.body, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                      {sug.name}
                    </Text>
                    <Text style={[text.caption, { color: colors.textMuted }]}>{formatPrice(sug.base_price)}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {!hasQuery && (
              <>
                {recentSearches.length > 0 && (
                  <View style={{ gap: vs(10) }}>
                    <View style={local.sectionHeaderRow}>
                      <Text style={[local.sectionLabel, { color: colors.textMuted }]}>RECIENTES</Text>
                      <Pressable onPress={() => setRecentSearches([])}>
                        <Text style={[text.caption, { color: colors.primary }]}>Limpiar</Text>
                      </Pressable>
                    </View>
                    <View style={local.chipsRow}>
                      {recentSearches.map((term) => (
                        <Pressable
                          key={term}
                          style={[local.chip, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.full }]}
                          onPress={() => commitSearch(term)}
                        >
                          <MaterialIcons name="history" size={13} color={colors.textMuted} />
                          <Text style={[text.caption, { color: colors.textSecondary }]}>{term}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                <View style={{ gap: vs(10) }}>
                  <Text style={[local.sectionLabel, { color: colors.textMuted }]}>EXPLORAR CATEGORÍAS</Text>
                  <View style={local.chipsRow}>
                    {categories.map((cat) => (
                      <Pressable
                        key={cat.id}
                        style={[local.chip, { backgroundColor: colors.primary + '1F', borderColor: colors.border, borderRadius: radii.full }]}
                        onPress={() => commitSearch(cat.name)}
                      >
                        <Text style={[text.caption, { color: colors.primaryDeep, fontWeight: '600' }]}>{cat.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </>
            )}

            {noResults && (
              <Text style={[text.body, { color: colors.textMuted, textAlign: "center", paddingVertical: vs(20) }]}>
                Sin resultados para "{query}".
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <SearchResultRow product={item} onPress={() => goToProduct(item.id)} onArtisanPress={goToStore} />
        )}
      />
    </SafeAreaView>
  );
}

function SearchResultRow({
  product,
  onPress,
  onArtisanPress,
}: {
  product: Product;
  onPress: () => void;
  onArtisanPress: (storeId: string) => void;
}) {
  const { colors, radii, text } = useTheme();
  const primaryImage = resolveProductImage(product);

  return (
    <Pressable
      style={[local.resultRow, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg }]}
      onPress={onPress}
    >
      <Image source={{ uri: primaryImage }} style={[local.resultImage, { borderRadius: radii.md, backgroundColor: colors.bgCardAlt }]} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[text.label, { color: colors.textPrimary, fontWeight: "700" }]} numberOfLines={1}>
          {product.name}
        </Text>
        {!!product.store && (
          <Pressable onPress={() => onArtisanPress(product.store!.id)} hitSlop={4}>
            <Text style={[text.caption, { color: colors.primaryDeep, marginTop: 2 }]} numberOfLines={1}>
              {product.store.name}
            </Text>
          </Pressable>
        )}
        <Text style={[text.label, { color: colors.primary, fontWeight: "700", marginTop: 5 }]}>
          {formatPrice(product.base_price)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(12),
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    borderBottomWidth: 0.5,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: s(8),
    paddingHorizontal: s(12),
    height: ms(42),
  },
  input: { flex: 1, fontSize: ms(15), padding: 0 },
  list: { padding: s(16), gap: vs(10) },
  suggestionsBox: { borderWidth: 0.5, overflow: "hidden" },
  suggestionRow: { flexDirection: "row", alignItems: "center", gap: s(10), padding: s(12), borderTopWidth: 0.5 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionLabel: { fontSize: ms(11), fontWeight: "500", letterSpacing: 1.1, textTransform: "uppercase" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: s(8) },
  chip: { flexDirection: "row", alignItems: "center", gap: s(6), paddingVertical: vs(8), paddingHorizontal: s(13), borderWidth: 0.5 },
  resultRow: { flexDirection: "row", alignItems: "center", gap: s(13), padding: s(10), borderWidth: 0.5 },
  resultImage: { width: 58, height: 58, flexShrink: 0 },
});
