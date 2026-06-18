import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { formatPrice } from "@/utils/format";
import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/auth/authStore";
import { getStoreByOwner, createStore } from "@/api/stores";
import { getProduct, getStoreProducts } from "@/api/products";
import { getStoreOrders } from "@/api/orders";
import type { Store, Product, StoreOrder } from "@/types/store";
import Header from "@/components/ui/Header";
import HamburgerMenu from "@/components/ui/HamburgerMenu";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function MyStoreScreen() {
  const { colors, spacing, radii, shadows, text } = useTheme();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPendingOrders, setTotalPendingOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [stockByProductId, setStockByProductId] = useState<Record<string, number>>({});

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const fetched = await getStoreByOwner(user.id);
      setStore(fetched);
      if (fetched) {
        const [prodRes, orderRes] = await Promise.all([
          getStoreProducts(fetched.id, 1, 5),
          getStoreOrders(fetched.id, 1, 5),
        ]);
        const detailedProducts = await Promise.all(
          prodRes.items.map(async (product) => {
            try {
              return await getProduct(product.id);
            } catch {
              return product;
            }
          })
        );

        const nextStockByProductId = Object.fromEntries(
          detailedProducts.map((product) => [
            product.id,
            (product.variants ?? []).reduce(
              (sum, variant) => sum + (Number(variant.stock_quantity) || 0),
              0
            ),
          ])
        );

        setProducts(detailedProducts);
        setStockByProductId(nextStockByProductId);
        setTotalProducts(prodRes.total);
        setOrders(orderRes.items);
        setTotalPendingOrders(orderRes.total);
      }
    } catch {
      setError("No se pudo cargar la tienda. Revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("es-CR", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const handleCreate = async () => {
    if (!storeName.trim() || !user) return;
    setSubmitLoading(true);
    try {
      const created = await createStore({
        owner_id: user.id,
        name: storeName.trim(),
        description: storeDesc.trim(),
      });
      setStore(created);
      setCreating(false);
    } catch {
      setError("No se pudo crear la tienda.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── No store yet ──────────────────────────────────────────────────────────
  if (!loading && !store && !error) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header onMenuPress={() => setMenuOpen(true)} />
        <ScrollView contentContainerStyle={local.centeredContent}>
          {creating ? (
            <View style={[local.cardForm, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.md }]}>
              <Text style={[text.h2, { color: colors.primaryDeep, marginBottom: spacing[3] }]}>Crear mi tienda</Text>
              <Input label="Nombre" value={storeName} onChangeText={setStoreName} placeholder="Ej: Artesanías Chorotega" />
              <Input label="Descripción" value={storeDesc} onChangeText={setStoreDesc} placeholder="Describe tu tienda..." multiline />
              <View style={local.createActions}>
                <Button title="Cancelar" variant="secondary" onPress={() => setCreating(false)} />
                <Button title="Crear" onPress={handleCreate} disabled={submitLoading || !storeName.trim()} />
              </View>
            </View>
          ) : (
            <View style={local.emptyState}>
              <MaterialIcons name="storefront" size={ms(80)} color={colors.primarySoft} style={{ marginBottom: spacing[3] }} />
              <Text style={[text.h2, { color: colors.primaryDeep, textAlign: "center" }]}>Aún no tienes una tienda</Text>
              <Text style={[text.body, { color: colors.textSecondary, textAlign: "center", marginVertical: spacing[3], lineHeight: ms(20) }]}>
                Crea tu tienda para comenzar a vender tus artesanías.
              </Text>
              <Button title="Crear tienda" onPress={() => setCreating(true)} />
            </View>
          )}
        </ScrollView>
        <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </SafeAreaView>
    );
  }

  // ── Main screen ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header onMenuPress={() => setMenuOpen(true)} />

      {loading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={local.centered}>
          <MaterialIcons name="error-outline" size={ms(48)} color={colors.errorText} />
          <Text style={[text.body, { color: colors.errorText, marginVertical: spacing[3], textAlign: "center" }]}>{error}</Text>
          <Button title="Reintentar" onPress={loadData} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={local.content} showsVerticalScrollIndicator={false}>

          {/* ── Panel de Control ── */}
          <View style={local.section}>
            <Text style={[text.h2, { color: colors.primaryDeep }]}>Panel de Control</Text>
            <View style={local.statsRow}>
              <View style={[local.statCard, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.sm }]}> 
                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/store/edit" as never, params: { storeId: store?.id } })}
                  hitSlop={10}
                  accessibilityLabel="Editar mi tienda"
                  accessibilityRole="button"
                  style={local.storeEditBtn}
                >
                  <MaterialIcons name="edit" size={ms(22)} color={colors.primary} />
                </TouchableOpacity>

                <View style={local.storeCardContent}>
                  <View style={local.storeIconWrap}>
                    <MaterialIcons name="storefront" size={ms(26)} color={colors.primary} />
                  </View>
                  <Text style={[text.caption, { color: colors.textSecondary, letterSpacing: 0.8, textTransform: "uppercase", marginTop: vs(6), textAlign: "center" }]}> 
                    Mi tienda
                  </Text>
                  <Text style={[text.label, { color: colors.textPrimary, marginTop: vs(2), textAlign: "center" }]} numberOfLines={1}>
                    {store?.name || "Configurar tienda"}
                  </Text>
                  <Text style={[text.caption, { color: colors.textSecondary, marginTop: vs(2), textAlign: "center" }]} numberOfLines={2}>
                    {store?.description || "Sin descripción"}
                  </Text>
                </View>
              </View>

              <View style={[local.statCard, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.sm }]}> 
                <MaterialIcons name="paid" size={ms(26)} color={colors.primary} />
                <Text style={[text.caption, { color: colors.textSecondary, letterSpacing: 0.8, textTransform: "uppercase", marginTop: vs(6) }]}> 
                  Ventas Totales
                </Text>
                <Text style={[text.h2, { color: colors.textPrimary, marginTop: vs(2) }]}> 
                  ₡285,000
                </Text>
              </View>
            </View>
          </View>

          {/* ── Mis Productos ── */}
          <View style={local.section}>
            <View style={local.sectionHeaderRow}>
              <Text style={[text.h2, { color: colors.primaryDeep }]}>Mis Productos</Text>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/store/products" as never, params: { storeId: store?.id } })}
                hitSlop={10}
              >
                <Text style={[text.label, { color: colors.primary }]}>Ver catálogo</Text>
              </TouchableOpacity>
            </View>

            <View style={local.productList}>
              {products.slice(0, 5).map((product) => {
                const stock = stockByProductId[product.id] ?? (product.variants ?? []).reduce(
                  (sum, v) => sum + (Number(v.stock_quantity) || 0), 0
                );
                const isOut = stock <= 0;
                return (
                  <TouchableOpacity
                    key={product.id}
                    style={[local.productCard, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.sm }]}
                    onPress={() => router.push({ pathname: "/store/products/[id]" as never, params: { id: product.id, storeId: store?.id } })}
                    activeOpacity={0.8}
                  >
                    <View style={[local.productThumb, { backgroundColor: colors.bgSection, borderRadius: radii.md }]}>
                      <MaterialIcons name="inventory-2" size={ms(24)} color={colors.primarySoft} />
                    </View>
                    <View style={local.productInfo}>
                      <Text style={[text.label, { color: colors.textPrimary, fontWeight: "700" }]} numberOfLines={1}>
                        {product.name}
                      </Text>
                      <Text style={[text.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                        Stock:{" "}
                        <Text style={{ color: isOut ? colors.errorText : colors.textPrimary, fontWeight: "700" }}>
                          {isOut ? "Agotado" : `${stock} un.`}
                        </Text>
                        {" • "}{formatPrice(product.base_price)}
                      </Text>
                    </View>
                    <MaterialIcons name="edit" size={ms(22)} color={colors.primary} />
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[local.addProductBtn, { backgroundColor: colors.primary, borderRadius: radii.lg }]}
              onPress={() => router.push({ pathname: "/store/products/add" as never, params: { storeId: store?.id } })}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={ms(22)} color={colors.textOnPrimary} />
              <Text style={[text.h3, { color: colors.textOnPrimary }]}>Agregar Producto</Text>
            </TouchableOpacity>
          </View>

          {/* ── Pedidos Recientes ── */}
          <View style={local.section}>
            <Text style={[text.h2, { color: colors.primaryDeep }]}>Pedidos Recientes</Text>

            {orders.length > 0 ? (
              orders.slice(0, 5).map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={[local.orderCard, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.sm }]}
                  onPress={() => router.push({ pathname: "/store/orders" as never, params: { storeId: store?.id } })}
                  activeOpacity={0.8}
                >
                  <View style={[local.orderIcon, { backgroundColor: colors.bgSection, borderRadius: radii.md }]}>
                    <MaterialIcons name="local-shipping" size={ms(22)} color={colors.primary} />
                  </View>
                  <View style={local.orderInfo}>
                    <Text style={[text.label, { color: colors.textPrimary, fontWeight: "700" }]} numberOfLines={1}>
                      Pedido #{String(order.order_id).slice(-4).toUpperCase()}
                    </Text>
                    <Text style={[text.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                      {formatDateTime(order.created_at) || "Reciente"}
                    </Text>
                  </View>
                  <View style={[local.statusPill, { backgroundColor: colors.bgSection, borderColor: colors.border, borderWidth: 0.5 }]}>
                    <Text style={[text.caption, { color: colors.primaryDeep, fontWeight: "700", letterSpacing: 0.5 }]}>
                      {String(order.seller_status || "PENDIENTE").toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={[local.emptyRow, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.sm }]}>
                <Text style={[text.body, { color: colors.textSecondary, textAlign: "center" }]}>
                  Todavía no hay pedidos recientes.
                </Text>
              </View>
            )}
          </View>

        </ScrollView>
      )}
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  content: { paddingVertical: vs(16), gap: vs(24) },
  centeredContent: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: s(24) },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: vs(12) },
  emptyState: { alignItems: "center", maxWidth: s(280) },
  cardForm: { width: "100%", padding: s(20), gap: vs(12), borderWidth: 0.5 },
  createActions: { flexDirection: "row", gap: s(12), justifyContent: "flex-end", marginTop: vs(8) },

  // Sections
  section: { paddingHorizontal: s(16), gap: vs(12) },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  // Panel stats
  statsRow: { flexDirection: "column", gap: s(12) },
  statCard: { width: "100%", padding: s(16), borderWidth: 0.5, alignItems: "center", position: "relative" },
  storeEditBtn: { position: "absolute", top: s(14), right: s(14), zIndex: 1 },
  storeCardContent: { width: "100%", alignItems: "center" },
  storeIconWrap: { width: ms(32), height: ms(32), justifyContent: "center", alignItems: "center" },

  // Products
  productList: { gap: vs(10) },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(12),
    padding: s(14),
    borderWidth: 0.5,
  },
  productThumb: { width: ms(52), height: ms(52), justifyContent: "center", alignItems: "center", flexShrink: 0 },
  productInfo: { flex: 1, minWidth: 0, gap: vs(3) },
  addProductBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s(8),
    paddingVertical: vs(14),
  },

  // Orders
  orderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(12),
    padding: s(14),
    borderWidth: 0.5,
  },
  orderIcon: { width: ms(40), height: ms(40), justifyContent: "center", alignItems: "center", flexShrink: 0 },
  orderInfo: { flex: 1, minWidth: 0, gap: vs(2) },
  statusPill: {
    paddingHorizontal: s(10),
    paddingVertical: vs(6),
    borderRadius: ms(999),
    flexShrink: 0,
  },
  emptyRow: { padding: s(16), borderWidth: 0.5, alignItems: "center" },
});