import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { formatPrice, translateStatus, statusColor } from "@/utils/format";
import { useTheme } from "@/src/theme";
import { getStoreOrders, updateOrderStatus } from "@/api/orders";
import type { StoreOrder } from "@/types/store";
import SubHeader from "@/components/ui/SubHeader";
import Button from "@/components/ui/Button";

const STATUS_FLOW = ["pending", "processing", "shipped", "delivered"] as const;

// Maps status key to MaterialIcons icon name
const STATUS_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  pending: "schedule",
  processing: "autorenew",
  shipped: "local-shipping",
  delivered: "check-circle",
  cancelled: "cancel",
};

export default function StoreOrdersScreen() {
  const { colors, spacing, radii, shadows, text } = useTheme();
  const router = useRouter();
  const { storeId } = useLocalSearchParams<{ storeId: string }>();

  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (p = 1, append = false) => {
    if (!storeId) return;
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await getStoreOrders(storeId, p, 15);
      setOrders(append ? (prev) => [...prev, ...res.items] : res.items);
      setTotal(res.total);
      setPage(p);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [storeId]);

  useFocusEffect(useCallback(() => { fetchOrders(1); }, [fetchOrders]));

  const handleAdvanceStatus = async (order: StoreOrder) => {
    if (!storeId) return;
    const currentIdx = STATUS_FLOW.indexOf(order.seller_status as typeof STATUS_FLOW[number]);
    if (currentIdx < 0 || currentIdx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[currentIdx + 1];
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderStatus(storeId, order.id, next);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...updated } : o)));
    } catch {
      Alert.alert("Error", "No se pudo actualizar el pedido.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (order: StoreOrder) => {
    if (!storeId) return;
    Alert.alert(
      "Cancelar pedido",
      "¿Estás seguro de que quieres cancelar este pedido?",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Cancelar pedido",
          style: "destructive",
          onPress: async () => {
            setUpdatingId(order.id);
            try {
              const updated = await updateOrderStatus(storeId, order.id, "cancelled");
              setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...updated } : o)));
            } catch {
              Alert.alert("Error", "No se pudo cancelar el pedido.");
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const canAdvance = (status: string) => {
    const idx = STATUS_FLOW.indexOf(status as typeof STATUS_FLOW[number]);
    return idx >= 0 && idx < STATUS_FLOW.length - 1;
  };

  const renderOrder = ({ item }: { item: StoreOrder }) => {
    const isUpdating = updatingId === item.id;
    const badgeBg = statusColor(item.seller_status);
    const statusIcon = STATUS_ICONS[item.seller_status] ?? "help-outline";
    const isFinal = item.seller_status === "cancelled" || item.seller_status === "delivered";

    return (
      <View
        style={[
          local.card,
          {
            backgroundColor: colors.bgCard,
            borderRadius: radii.lg,
            borderColor: colors.border,
            ...shadows.sm,
          },
        ]}
      >
        {/* Card header */}
        <View style={local.cardHeader}>
          <View style={local.orderIdRow}>
            <MaterialIcons name="receipt-long" size={ms(18)} color={colors.primarySoft} />
            <Text style={[text.label, { color: colors.textPrimary, fontWeight: "700" }]} numberOfLines={1}>
              Pedido #{item.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
          <View style={[local.badge, { backgroundColor: badgeBg + "22", borderColor: badgeBg, borderWidth: 1 }]}>
            <MaterialIcons name={statusIcon} size={ms(12)} color={badgeBg} />
            <Text style={[local.badgeText, { color: badgeBg }]}>
              {translateStatus(item.seller_status)}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={[local.divider, { backgroundColor: colors.border }]} />

        {/* Order items */}
        <View style={local.itemsList}>
          {item.items.map((oi) => (
            <View key={oi.id} style={local.itemRow}>
              <View style={[local.qtyBadge, { backgroundColor: colors.bgSection, borderRadius: radii.sm }]}>
                <Text style={[text.caption, { color: colors.textSecondary, fontWeight: "700" }]}>
                  x{oi.quantity}
                </Text>
              </View>
              <Text
                style={[text.body, { color: colors.textPrimary, flex: 1 }]}
                numberOfLines={1}
              >
                {oi.product?.name ?? `Producto ${oi.product_id.slice(0, 8)}`}
              </Text>
              <Text style={[text.label, { color: colors.primary, fontWeight: "700" }]}>
                {formatPrice(oi.unit_price)}
              </Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        {!isFinal && (
          <>
            <View style={[local.divider, { backgroundColor: colors.border }]} />
            <View style={local.actions}>
              {canAdvance(item.seller_status) && (
                <Button
                  title={
                    isUpdating
                      ? "Actualizando..."
                      : `Marcar: ${translateStatus(
                        STATUS_FLOW[
                        STATUS_FLOW.indexOf(item.seller_status as typeof STATUS_FLOW[number]) + 1
                        ]
                      )}`
                  }
                  onPress={() => handleAdvanceStatus(item)}
                  disabled={isUpdating}
                />
              )}
              <Button
                title="Cancelar pedido"
                variant="ghost"
                onPress={() => handleCancel(item)}
                disabled={isUpdating}
              />
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={[local.wrapper, { backgroundColor: colors.bgPage }]}>
      <SubHeader title="Pedidos recibidos" onBack={() => router.back()} />

      {loading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={local.centered}>
          <View style={[local.emptyIcon, { backgroundColor: colors.bgSection, borderRadius: radii.xl }]}>
            <MaterialIcons name="receipt-long" size={ms(48)} color={colors.primarySoft} />
          </View>
          <Text style={[text.h3, { color: colors.primaryDeep, marginTop: spacing[4], textAlign: "center" }]}>
            No hay pedidos aún
          </Text>
          <Text style={[text.body, { color: colors.textSecondary, textAlign: "center" }]}>
            Los pedidos de tus clientes aparecerán aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={local.list}
          onEndReached={() => {
            if (!loadingMore && orders.length < total) fetchOrders(page + 1, true);
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
  list: { padding: s(16), gap: vs(12) },
  card: { padding: s(16), gap: vs(10), borderWidth: 0.5, overflow: "hidden" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderIdRow: { flexDirection: "row", alignItems: "center", gap: s(6), flex: 1 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(4),
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: 20,
  },
  badgeText: { fontSize: ms(11), fontWeight: "700" },
  divider: { height: 0.5, marginHorizontal: 0 },
  itemsList: { gap: vs(8) },
  itemRow: { flexDirection: "row", alignItems: "center", gap: s(10) },
  qtyBadge: { paddingHorizontal: s(8), paddingVertical: vs(2), minWidth: ms(32), alignItems: "center" },
  actions: { flexDirection: "row", gap: s(8), flexWrap: "wrap" },
  emptyIcon: { width: ms(96), height: ms(96), justifyContent: "center", alignItems: "center" },
  footer: { paddingVertical: vs(16) },
});
