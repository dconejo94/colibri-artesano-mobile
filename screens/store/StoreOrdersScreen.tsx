import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { formatPrice, translateStatus, statusColor } from "@/utils/format";
import shared from "@/constants/shared-styles";
import { getStoreOrders, updateOrderStatus } from "@/api/orders";
import type { StoreOrder } from "@/types/store";
import SubHeader from "@/components/ui/SubHeader";
import Button from "@/components/ui/Button";

const STATUS_FLOW = ["pending", "processing", "shipped", "delivered"] as const;

export default function StoreOrdersScreen() {
  const isDark = useColorScheme() === "dark";
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
    } catch { /* silent */ } finally {
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
    } catch { /* silent */ } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (order: StoreOrder) => {
    if (!storeId) return;
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderStatus(storeId, order.id, "cancelled");
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...updated } : o)));
    } catch { /* silent */ } finally {
      setUpdatingId(null);
    }
  };

  const canAdvance = (status: string) => {
    const idx = STATUS_FLOW.indexOf(status as typeof STATUS_FLOW[number]);
    return idx >= 0 && idx < STATUS_FLOW.length - 1;
  };

  const renderOrder = ({ item }: { item: StoreOrder }) => {
    const isUpdating = updatingId === item.id;
    return (
      <View style={[local.orderCard, isDark ? local.orderCardDark : local.orderCardLight]}>
        <View style={local.orderHeader}>
          <Text style={[local.orderId, isDark && shared.textDark]} numberOfLines={1}>
            Pedido #{item.id.slice(0, 8)}
          </Text>
          <View style={[local.badge, { backgroundColor: statusColor(item.seller_status) }]}>
            <Text style={local.badgeText}>{translateStatus(item.seller_status)}</Text>
          </View>
        </View>

        <View style={local.itemsList}>
          {item.items.map((oi) => (
            <View key={oi.id} style={local.itemRow}>
              <Text style={[local.itemName, isDark && shared.textDark]} numberOfLines={1}>
                {oi.product?.name ?? `Producto ${oi.product_id.slice(0, 8)}`}
              </Text>
              <Text style={[local.itemQty, isDark && shared.textMuted]}>x{oi.quantity}</Text>
              <Text style={[local.itemPrice, isDark && shared.textMuted]}>
                {formatPrice(oi.unit_price)}
              </Text>
            </View>
          ))}
        </View>

        {item.seller_status !== "cancelled" && item.seller_status !== "delivered" && (
          <View style={local.orderActions}>
            {canAdvance(item.seller_status) && (
              <Button
                title={isUpdating ? "..." : `Marcar: ${translateStatus(STATUS_FLOW[STATUS_FLOW.indexOf(item.seller_status as typeof STATUS_FLOW[number]) + 1])}`}
                onPress={() => handleAdvanceStatus(item)}
                disabled={isUpdating}
              />
            )}
            <Button title="Cancelar" variant="outline" onPress={() => handleCancel(item)} disabled={isUpdating} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={[shared.wrapper, isDark && shared.wrapperDark]}>
      <SubHeader title="Pedidos" onBack={() => router.back()} />

      {loading ? (
        <View style={shared.centered}>
          <ActivityIndicator size="large" color={isDark ? "#82A8AC" : "#6B9E98"} />
        </View>
      ) : orders.length === 0 ? (
        <View style={shared.centered}>
          <MaterialIcons name="receipt-long" size={ms(64)} color={isDark ? "#4E7C74" : "#82A8AC"} />
          <Text style={[local.emptyTitle, isDark && shared.textDark]}>No hay pedidos aún</Text>
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
          ListFooterComponent={loadingMore ? <ActivityIndicator style={local.footer} color="#6B9E98" /> : null}
        />
      )}
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  list: { padding: s(16), gap: vs(12) },
  orderCard: { borderRadius: ms(12), padding: s(16), gap: vs(12) },
  orderCardLight: { backgroundColor: "#f5f5f5" },
  orderCardDark: { backgroundColor: "#1a1a1a" },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderId: { fontSize: ms(14), fontWeight: "700", color: "#000", flex: 1 },
  badge: { paddingHorizontal: s(10), paddingVertical: vs(4), borderRadius: ms(12) },
  badgeText: { fontSize: ms(11), color: "#fff", fontWeight: "600" },
  itemsList: { gap: vs(6) },
  itemRow: { flexDirection: "row", alignItems: "center", gap: s(8) },
  itemName: { flex: 1, fontSize: ms(13), color: "#000" },
  itemQty: { fontSize: ms(12), color: "#687076", fontWeight: "600" },
  itemPrice: { fontSize: ms(12), color: "#687076", minWidth: s(70), textAlign: "right" },
  orderActions: { flexDirection: "row", gap: s(8), flexWrap: "wrap" },
  emptyTitle: { fontSize: ms(16), fontWeight: "600", color: "#000" },
  footer: { paddingVertical: vs(16) },
});
