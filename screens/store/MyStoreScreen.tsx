import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { formatPrice, translateStatus, statusColor } from "@/utils/format";
import { useAuthStore } from "@/src/auth/authStore";
import shared from "@/constants/shared-styles";
import { getStoreByOwner, createStore } from "@/api/stores";
import { getStoreProducts } from "@/api/products";
import { getStoreOrders } from "@/api/orders";
import type { Store, Product, StoreOrder } from "@/types/store";
import Header from "@/components/ui/Header";
import HamburgerMenu from "@/components/ui/HamburgerMenu";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function MyStoreScreen() {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const fetched = await getStoreByOwner(userId);
      setStore(fetched);
      if (fetched) {
        const [prodRes, orderRes] = await Promise.all([
          getStoreProducts(fetched.id, 1, 5),
          getStoreOrders(fetched.id, 1, 5),
        ]);
        setProducts(prodRes.items);
        setOrders(orderRes.items);
      }
    } catch {
      setError("No se pudo cargar la tienda. Revisa tu conexion.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleCreate = async () => {
    if (!storeName.trim() || !userId) return;
    setSubmitLoading(true);
    try {
      const created = await createStore({
        owner_id: userId,
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

  const pendingOrders = orders.filter(
    (o) => o.seller_status === "pending" || o.seller_status === "processing"
  );

  if (!loading && !store && !error) {
    return (
      <SafeAreaView edges={["top"]} style={[shared.wrapper, isDark && shared.wrapperDark]}>
        <Header onMenuPress={() => setMenuOpen(true)} />
        <ScrollView contentContainerStyle={local.centeredContent}>
          {creating ? (
            <View style={[shared.card, isDark && shared.cardDark]}>
              <Text style={[local.createTitle, isDark && shared.textDark]}>Crear mi tienda</Text>
              <Input label="Nombre" value={storeName} onChangeText={setStoreName} placeholder="Ej: Artesanias Chorotega" />
              <Input label="Descripción" value={storeDesc} onChangeText={setStoreDesc} placeholder="Describe tu tienda..." multiline />
              <View style={local.createActions}>
                <Button title="Cancelar" variant="ghost" onPress={() => setCreating(false)} />
                <Button title="Crear" onPress={handleCreate} disabled={submitLoading || !storeName.trim()} />
              </View>
            </View>
          ) : (
            <View style={local.emptyState}>
              <MaterialIcons name="storefront" size={ms(80)} color={isDark ? "#4E7C74" : "#82A8AC"} />
              <Text style={[local.emptyTitle, isDark && shared.textDark]}>Aún no tienes una tienda</Text>
              <Text style={[local.emptyBody, isDark && shared.textMuted]}>
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

  return (
    <SafeAreaView edges={["top"]} style={[shared.wrapper, isDark && shared.wrapperDark]}>
      <Header onMenuPress={() => setMenuOpen(true)} />
      {loading ? (
        <View style={shared.centered}>
          <ActivityIndicator size="large" color={isDark ? "#82A8AC" : "#6B9E98"} />
        </View>
      ) : error ? (
        <View style={shared.centered}>
          <MaterialIcons name="error-outline" size={ms(48)} color="#EF4444" />
          <Text style={[shared.errorText, isDark && shared.textDark]}>{error}</Text>
          <Button title="Reintentar" onPress={loadData} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={local.content} showsVerticalScrollIndicator={false}>
          <View style={[local.storeCard, isDark ? local.storeCardDark : local.storeCardLight]}>
            <View style={local.storeCardHeader}>
              <MaterialIcons name="storefront" size={ms(36)} color={isDark ? "#ACD4CD" : "#6B9E98"} />
              <View style={local.storeInfo}>
                <Text style={[local.storeName, isDark && shared.textDark]} numberOfLines={1}>{store?.name}</Text>
                <Text style={[local.storeDesc, isDark && shared.textMuted]} numberOfLines={2}>{store?.description || "Sin descripción"}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push({ pathname: "/store/edit" as never, params: { storeId: store?.id } })} hitSlop={12}>
                <MaterialIcons name="edit" size={ms(22)} color={isDark ? "#ACD4CD" : "#6B9E98"} />
              </TouchableOpacity>
            </View>
            <View style={local.statsRow}>
              {[
                { icon: "inventory-2" as const, label: "Productos", value: String(products.length) },
                { icon: "local-shipping" as const, label: "Pendientes", value: String(pendingOrders.length) },
              ].map((stat) => (
                <View key={stat.label} style={[local.statItem, isDark && local.statItemDark]}>
                  <MaterialIcons name={stat.icon} size={ms(20)} color={isDark ? "#ACD4CD" : "#6B9E98"} />
                  <Text style={[local.statValue, isDark && shared.textDark]}>{stat.value}</Text>
                  <Text style={[local.statLabel, isDark && shared.textMuted]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={local.actionsSection}>
            <Text style={[shared.sectionTitle, isDark && shared.textDark]}>Acciones rápidas</Text>
            <View style={local.actionsGrid}>
              {([
                { icon: "add-box" as const, label: "Agregar producto", route: "/store/products/add" as const },
                { icon: "inventory" as const, label: "Mis productos", route: "/store/products" as const },
                { icon: "receipt-long" as const, label: "Pedidos", route: "/store/orders" as const },
                { icon: "edit" as const, label: "Editar tienda", route: "/store/edit" as const },
              ]).map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={[local.actionCard, isDark ? local.actionCardDark : local.actionCardLight]}
                  onPress={() => router.push({ pathname: action.route as never, params: { storeId: store?.id } })}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name={action.icon} size={ms(28)} color={isDark ? "#ACD4CD" : "#6B9E98"} />
                  <Text style={[local.actionLabel, isDark && shared.textDark]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>
      )}
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  content: { paddingBottom: vs(32) },
  centeredContent: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: s(24) },
  emptyState: { alignItems: "center", gap: vs(16), maxWidth: s(280) },
  emptyTitle: { fontSize: ms(20), fontWeight: "700", color: "#000", textAlign: "center" },
  emptyBody: { fontSize: ms(14), color: "#687076", textAlign: "center", lineHeight: ms(20) },
  createTitle: { fontSize: ms(18), fontWeight: "700", color: "#000" },
  createActions: { flexDirection: "row", gap: s(12), justifyContent: "flex-end" },
  storeCard: { margin: s(16), borderRadius: ms(16), padding: s(16), gap: vs(16) },
  storeCardLight: { backgroundColor: "#ACD4CD" },
  storeCardDark: { backgroundColor: "#2A4A45" },
  storeCardHeader: { flexDirection: "row", alignItems: "center", gap: s(12) },
  storeInfo: { flex: 1 },
  storeName: { fontSize: ms(18), fontWeight: "700", color: "#000" },
  storeDesc: { fontSize: ms(12), color: "#333", marginTop: vs(2) },
  statsRow: { flexDirection: "row", gap: s(12) },
  statItem: { flex: 1, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: ms(12), padding: s(12), alignItems: "center", gap: vs(4) },
  statItemDark: { backgroundColor: "rgba(0,0,0,0.25)" },
  statValue: { fontSize: ms(20), fontWeight: "700", color: "#000" },
  statLabel: { fontSize: ms(10), color: "#333", textAlign: "center" },
  actionsSection: { paddingHorizontal: s(16), gap: vs(12) },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: s(12) },
  actionCard: { width: "47%", borderRadius: ms(12), padding: s(16), alignItems: "center", gap: vs(8) },
  actionCardLight: { backgroundColor: "#FAE4E4" },
  actionCardDark: { backgroundColor: "#3F1D23" },
  actionLabel: { fontSize: ms(12), fontWeight: "600", color: "#000", textAlign: "center" },
  previewSection: { marginTop: vs(24), paddingHorizontal: s(16), gap: vs(8) },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  viewAll: { fontSize: ms(13), color: "#6B9E98", fontWeight: "600" },
  listRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: ms(10), padding: s(12), marginTop: vs(4) },
  listRowLight: { backgroundColor: "#f5f5f5" },
  listRowDark: { backgroundColor: "#1a1a1a" },
  rowInfo: { flex: 1, gap: vs(2) },
  rowTitle: { fontSize: ms(13), fontWeight: "600", color: "#000" },
  rowSub: { fontSize: ms(11), color: "#687076" },
  statusBadge: { paddingHorizontal: s(10), paddingVertical: vs(4), borderRadius: ms(12) },
  statusText: { fontSize: ms(11), color: "#fff", fontWeight: "600" },
});
