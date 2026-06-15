import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { formatPrice } from "@/utils/format";
import { useTheme } from "@/src/theme";
import { getStoreProducts } from "@/api/products";
import type { Product } from "@/types/store";
import SubHeader from "@/components/ui/SubHeader";
import Button from "@/components/ui/Button";

export default function ProductListScreen() {
  const { colors, spacing, radii, shadows, text } = useTheme();
  const router = useRouter();
  const { storeId } = useLocalSearchParams<{ storeId: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = useCallback(async (p = 1, append = false) => {
    if (!storeId) return;
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await getStoreProducts(storeId, p, 20);
      setProducts(append ? (prev) => [...prev, ...res.items] : res.items);
      setTotal(res.total);
      setPage(p);
    } catch { /* silent */ } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [storeId]);

  useFocusEffect(useCallback(() => { fetchProducts(1); }, [fetchProducts]));

  const totalStock = (product: Product) =>
    product.variants?.reduce((sum: number, v: { stock_quantity: number }) => sum + v.stock_quantity, 0) || 0;

  const addButton = (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/store/products/add" as never, params: { storeId } })}
      hitSlop={12}
    >
      <MaterialIcons name="add-circle" size={ms(28)} color={colors.primary} />
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[
        local.card,
        {
          backgroundColor: colors.bgCard,
          borderRadius: radii.lg,
          borderColor: colors.border,
          ...shadows.sm,
        },
      ]}
      onPress={() =>
        router.push({
          pathname: "/store/products/[id]" as never,
          params: { id: item.id, storeId },
        })
      }
      activeOpacity={0.75}
    >
      {/* Inactive ribbon */}
      {!item.is_active && (
        <View style={[local.ribbon, { backgroundColor: colors.errorBg }]}>
          <Text style={[local.ribbonText, { color: colors.errorText }]}>Inactivo</Text>
        </View>
      )}

      <View style={local.cardRow}>
        {/* Icon placeholder */}
        <View style={[local.iconBox, { backgroundColor: colors.bgSection, borderRadius: radii.md }]}>
          <MaterialIcons name="inventory-2" size={ms(28)} color={colors.primarySoft} />
        </View>

        <View style={local.cardInfo}>
          <Text style={[text.label, { color: colors.primaryDeep, fontWeight: "700" }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description ? (
            <Text style={[text.caption, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
          <View style={local.metaRow}>
            <Text style={[text.price, { color: colors.primary, fontSize: ms(14) }]}>
              {formatPrice(item.base_price)}
            </Text>
            <View style={[local.stockPill, { backgroundColor: colors.bgSection }]}>
              <MaterialIcons name="layers" size={ms(12)} color={colors.textMuted} />
              <Text style={[text.caption, { color: colors.textMuted }]}>
                Stock: {totalStock(item)}
              </Text>
            </View>
          </View>
        </View>

        <MaterialIcons name="chevron-right" size={ms(22)} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} style={[local.wrapper, { backgroundColor: colors.bgPage }]}>
      <SubHeader title="Mis productos" onBack={() => router.back()} rightSlot={addButton} />

      {loading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={local.centered}>
          <View style={[local.emptyIcon, { backgroundColor: colors.bgSection, borderRadius: radii.xl }]}>
            <MaterialIcons name="inventory-2" size={ms(48)} color={colors.primarySoft} />
          </View>
          <Text style={[text.h3, { color: colors.primaryDeep, marginTop: spacing[4], textAlign: "center" }]}>
            Sin productos aún
          </Text>
          <Text style={[text.body, { color: colors.textSecondary, marginBottom: spacing[4], textAlign: "center" }]}>
            Agrega tu primer producto para empezar a vender.
          </Text>
          <Button
            title="Agregar producto"
            onPress={() =>
              router.push({ pathname: "/store/products/add" as never, params: { storeId } })
            }
          />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={local.list}
          onEndReached={() => {
            if (!loadingMore && products.length < total) fetchProducts(page + 1, true);
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={local.footer} color={colors.primary} />
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  wrapper: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: s(24), gap: vs(12) },
  list: { padding: s(16), gap: vs(10) },
  card: { padding: s(14), borderWidth: 0.5, overflow: "hidden" },
  cardRow: { flexDirection: "row", alignItems: "center", gap: s(12) },
  iconBox: { width: ms(52), height: ms(52), justifyContent: "center", alignItems: "center" },
  cardInfo: { flex: 1, gap: vs(3) },
  metaRow: { flexDirection: "row", alignItems: "center", gap: s(10), marginTop: vs(2) },
  stockPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(3),
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: 20,
  },
  ribbon: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: s(10),
    paddingVertical: vs(3),
    borderBottomLeftRadius: 10,
    zIndex: 1,
  },
  ribbonText: { fontSize: ms(10), fontWeight: "700" },
  emptyIcon: { width: ms(96), height: ms(96), justifyContent: "center", alignItems: "center" },
  footer: { paddingVertical: vs(16) },
});
