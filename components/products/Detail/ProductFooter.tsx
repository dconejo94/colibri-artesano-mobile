import { ms, s, vs } from "@/utils/scale";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

type Props = {
  onAddToCart: () => void;
  onBuyNow: () => void;
};

export function ProductFooter({ onAddToCart, onBuyNow }: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: isDark ? "#111" : "#fff" },
        isDark ? styles.borderDark : styles.borderLight,
      ]}
    >
      <TouchableOpacity style={styles.cartBtn} onPress={onAddToCart} activeOpacity={0.8}>
        <Text style={styles.cartText}>Agregar al carrito</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buyBtn} onPress={onBuyNow} activeOpacity={0.8}>
        <Text style={styles.buyText}>Comprar ahora</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    padding: s(14),
    paddingBottom: vs(28),
    gap: s(10),
    borderTopWidth: 1,
  },
  borderLight: { borderTopColor: "#E5E5E5" },
  borderDark: { borderTopColor: "#222" },
  cartBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#82A8AC",
    borderRadius: ms(24),
    paddingVertical: vs(12),
    alignItems: "center",
  },
  cartText: { color: "#3E5F63", fontWeight: "700", fontSize: ms(14) },
  buyBtn: {
    flex: 1,
    backgroundColor: "#3E5F63",
    borderRadius: ms(24),
    paddingVertical: vs(12),
    alignItems: "center",
  },
  buyText: { color: "#fff", fontWeight: "700", fontSize: ms(14) },
});