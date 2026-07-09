import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { formatPrice } from "@/utils/format";
import { useTheme } from "@/src/theme";
import { useCart } from "@/src/hooks/useCart";
import ErrorBanner from "@/src/components/ErrorBanner";
import CartItemRow from "@/src/components/CartItemRow";
import SubHeader from "@/components/ui/SubHeader";
import Button from "@/components/ui/Button";

export default function CartScreen() {
  const { colors, radii, text } = useTheme();
  const router = useRouter();
  const { cart, isLoading, isMutating, error, refetch, increment, decrement, remove } = useCart();

  const isEmpty = !cart || cart.stores.every((store) => store.items.length === 0);

  const handleGoToCheckout = () => {
    router.push("/checkout" as any);
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SubHeader title="Carrito" onBack={() => router.back()} />

      {isLoading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && !cart ? (
        <ErrorBanner error={error} onRetry={refetch} variant="centered" />
      ) : isEmpty ? (
        <View style={local.centered}>
          <View style={[local.emptyIcon, { backgroundColor: colors.bgSection, borderRadius: radii.full }]}>
            <MaterialIcons name="shopping-cart" size={ms(40)} color={colors.primarySoft} />
          </View>
          <Text style={[text.h3, { color: colors.primaryDeep, marginTop: vs(16), textAlign: "center" }]}>
            Tu carrito está vacío
          </Text>
          <Text style={[text.body, { color: colors.textSecondary, textAlign: "center", marginTop: vs(6) }]}>
            Explora nuestras piezas artesanales y añade tus favoritas.
          </Text>
          <Button title="Ver productos" variant="secondary" onPress={() => router.push("/productos" as any)} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={local.content} showsVerticalScrollIndicator={false}>
            <ErrorBanner error={error} onDismiss={() => {}} />
            {cart!.stores.map((group) => (
              <View key={group.id} style={local.storeGroup}>
                <View style={local.storeHeader}>
                  <MaterialIcons name="storefront" size={ms(16)} color={colors.primary} />
                  <Text style={[text.label, { color: colors.textPrimary, fontWeight: "700" }]}>
                    {group.store_name}
                  </Text>
                </View>
                <View style={{ gap: vs(10) }}>
                  {group.items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      disabled={isMutating}
                      onIncrement={() => increment(item)}
                      onDecrement={() => decrement(item)}
                      onRemove={() => remove(item)}
                    />
                  ))}
                </View>
                <Text style={[text.caption, { color: colors.textMuted, textAlign: "right", marginTop: vs(4) }]}>
                  Subtotal: {formatPrice(group.subtotal_amount)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={[local.footer, { backgroundColor: colors.bgPage, borderTopColor: colors.border }]}>
            <View style={local.totalRow}>
              <Text style={[text.h3, { color: colors.textPrimary, fontWeight: "bold" }]}>Total</Text>
              <Text style={[text.h3, { color: colors.primary, fontWeight: "bold", fontSize: ms(20) }]}>{formatPrice(cart!.total_amount)}</Text>
            </View>
            <Button
              title="Continuar a la compra"
              onPress={handleGoToCheckout}
              disabled={isMutating}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: s(32), gap: vs(4) },
  emptyIcon: { width: ms(80), height: ms(80), alignItems: "center", justifyContent: "center" },
  content: { padding: s(16), gap: vs(20) },
  storeGroup: { gap: vs(10) },
  storeHeader: { flexDirection: "row", alignItems: "center", gap: s(8) },
  footer: {
    borderTopWidth: 0.5,
    padding: s(16),
    paddingBottom: vs(24),
    gap: vs(10),
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});