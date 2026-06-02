import { ms, s, vs } from "@/utils/scale";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

type Props = {
  price: number | null;
  rating: number;
  reviewCount: number;
  stock: number;
  qty: number;
  onQtyChange: (qty: number) => void;
};

export function ProductMeta({ price, rating, reviewCount, stock, qty, onQtyChange }: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={styles.container}>
      <View style={styles.priceRow}>
        <View>
          <Text style={styles.priceCurrency}>CRC</Text>
          <Text style={[styles.priceAmount, { color: isDark ? "#fff" : "#1A1A1A" }]}>
            {price != null ? `₡${price.toLocaleString("es-CR")}` : "—"}
          </Text>
        </View>

        <View style={[styles.qtyControl, { backgroundColor: isDark ? "#2A2A2A" : "#F0F5F5" }]}>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => onQtyChange(Math.max(1, qty - 1))}
          >
            <MaterialIcons name="remove" size={ms(18)} color="#3E5F63" />
          </TouchableOpacity>
          <Text style={[styles.qtyValue, { color: isDark ? "#fff" : "#1A1A1A" }]}>
            {qty}
          </Text>
          <TouchableOpacity hitSlop={8} onPress={() => onQtyChange(qty + 1)}>
            <MaterialIcons name="add" size={ms(18)} color="#3E5F63" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.ratingRow}>
        <MaterialIcons name="star" size={ms(15)} color="#F5C842" />
        <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
        <Text style={styles.ratingMeta}>
          · {reviewCount} reseñas · {stock} disp.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: vs(10) },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceCurrency: { fontSize: ms(11), color: "#3E5F63", fontWeight: "600" },
  priceAmount: { fontSize: ms(28), fontWeight: "800", lineHeight: ms(34) },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(12),
    borderRadius: ms(24),
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
  },
  qtyValue: { fontSize: ms(16), fontWeight: "700", minWidth: ms(16), textAlign: "center" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: s(4) },
  ratingValue: { fontSize: ms(13), fontWeight: "700", color: "#3E5F63" },
  ratingMeta: { fontSize: ms(12), opacity: 0.5 },
});