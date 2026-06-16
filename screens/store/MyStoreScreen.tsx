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
import { useFocusEffect, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { OWNER_ID } from "@/constants/auth";
import { useTheme } from "@/src/theme";
import { getStoreByOwner, createStore } from "@/api/stores";
import { getStoreProducts } from "@/api/products";
import { getStoreOrders } from "@/api/orders";
import type { Store, Product, StoreOrder } from "@/types/store";
import Header from "@/components/ui/Header";
import HamburgerMenu from "@/components/ui/HamburgerMenu";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function MyStoreScreen() {
  const { colors, spacing, radii, shadows, text, isDark } = useTheme();
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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await getStoreByOwner(OWNER_ID);
      setStore(fetched);
      if (fetched) {
        const [prodRes, orderRes] = await Promise.all([
          getStoreProducts(fetched.id, 1, 5),
          getStoreOrders(fetched.id, 1, 5),
        ]);
        setProducts(prodRes.items);
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

  const handleCreate = async () => {
    if (!storeName.trim()) return;
    setSubmitLoading(true);
    try {
      const created = await createStore({
        owner_id: OWNER_ID,
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

  if (!loading && !store && !error) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
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

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
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
          {/* Tarjeta de la tienda */}
          <View style={[local.storeCard, { backgroundColor: colors.bgSection, borderRadius: radii.lg, borderColor: colors.border, ...shadows.sm }]}>
            <View style={local.storeCardHeader}>
              <MaterialIcons name="storefront" size={ms(36)} color={colors.primary} />
              <View style={local.storeInfo}>
                <Text style={[text.h2, { color: colors.primaryDeep }]} numberOfLines={1}>{store?.name}</Text>
                <Text style={[text.body, { color: colors.textSecondary, marginTop: vs(2) }]} numberOfLines={2}>{store?.description || "Sin descripción"}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push({ pathname: "/store/edit" as never, params: { storeId: store?.id } })} hitSlop={12}>
                <MaterialIcons name="edit" size={ms(22)} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={local.statsRow}>
              {[
                { icon: "inventory-2" as const, label: "Productos", value: String(totalProducts) },
                { icon: "local-shipping" as const, label: "Pendientes", value: String(totalPendingOrders) },
              ].map((stat) => (
                <View key={stat.label} style={[local.statItem, { backgroundColor: colors.bgCard, borderRadius: radii.md, borderColor: colors.border, borderWidth: 0.5 }]}>
                  <MaterialIcons name={stat.icon} size={ms(20)} color={colors.primary} />
                  <Text style={[text.priceDetail, { color: colors.textPrimary, fontSize: ms(20) }]}>{stat.value}</Text>
                  <Text style={[text.caption, { color: colors.textSecondary, textAlign: "center" }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Acciones Rápidas */}
          <View style={[local.actionsSection, { paddingHorizontal: spacing[4] }]}>
            <Text style={[text.h3, { color: colors.primaryDeep, marginBottom: spacing[3] }]}>Acciones rápidas</Text>
            {([
              [
                { icon: "add-box" as const, label: "Agregar producto", route: "/store/products/add" as const },
                { icon: "inventory" as const, label: "Mis productos", route: "/store/products" as const },
              ],
              [
                { icon: "receipt-long" as const, label: "Pedidos", route: "/store/orders" as const },
                { icon: "edit" as const, label: "Editar tienda", route: "/store/edit" as const },
              ],
            ]).map((row, rowIdx) => (
              <View key={rowIdx} style={local.actionsRow}>
                {row.map((action) => (
                  <TouchableOpacity
                    key={action.label}
                    style={[local.actionCard, { backgroundColor: colors.bgCard, borderRadius: radii.md, borderColor: colors.border, borderWidth: 0.5, ...shadows.sm }]}
                    onPress={() => router.push({ pathname: action.route as never, params: { storeId: store?.id } })}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name={action.icon} size={ms(28)} color={colors.primary} />
                    <Text style={[text.label, { color: colors.textPrimary, textAlign: "center" }]}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
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
  content: { paddingBottom: vs(32) },
  centeredContent: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: s(24) },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyState: { alignItems: "center", maxWidth: s(280) },
  cardForm: { width: "100%", padding: s(20), gap: vs(12), borderWidth: 0.5 },
  createActions: { flexDirection: "row", gap: s(12), justifyContent: "flex-end", marginTop: vs(8) },

  // CORRECCIÓN: Eliminamos restricciones rígidas y aseguramos que crezca con minHeight si es necesario
  storeCard: {
    margin: s(16),
    padding: s(16),
    gap: vs(16),
    borderWidth: 0.5,
    height: "auto",             // Fuerza a que la altura sea dinámica
    alignSelf: "stretch",       // Ocupa todo el ancho disponible del contenedor padre
  },
  storeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(12),
    width: "100%"
  },
  storeInfo: { flex: 1 },

  // CORRECCIÓN: Controlamos que los elementos no se desborden horizontalmente
  statsRow: {
    flexDirection: "row",
    gap: s(12),
    width: "100%",
    justifyContent: "space-between",
    alignItems: "stretch"       // Hace que todas las tarjetas midan lo mismo de alto
  },

  // CORRECCIÓN: Controlamos el espacio interno para que no asfixie al texto
  statItem: {
    flex: 1,
    paddingVertical: vs(12),    // Usamos padding vertical escalado explícito
    paddingHorizontal: s(4),    // Menos padding horizontal para evitar que colapse el texto en pantallas angostas
    alignItems: "center",
    justifyContent: "center",
    gap: vs(4)
  },

  actionsSection: { gap: vs(12) },
  actionsRow: { flexDirection: "row", gap: s(12), marginBottom: vs(12) },
  actionCard: { flex: 1, padding: s(16), alignItems: "center", gap: vs(8) },
});