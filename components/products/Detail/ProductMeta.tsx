import { useTheme } from "@/src/theme";
import { ms, s, vs } from "@/utils/scale";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  price: number | null;
  rating: number;
  reviewCount: number;
  stock: number;
  qty: number;
  onQtyChange: (qty: number) => void;
};

export function ProductMeta({ price, rating, reviewCount, stock, qty, onQtyChange }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.priceRow}>
        <View>
          <Text style={[styles.priceCurrency, { color: colors.primary }]}>CRC</Text>
          <Text style={[styles.priceAmount, { color: colors.textPrimary }]}>
            {price != null ? `₡${price.toLocaleString("es-CR")}` : "—"}
          </Text>
        </View>

        <View style={[styles.qtyControl, { backgroundColor: colors.bgSection }]}>
          <TouchableOpacity hitSlop={8} onPress={() => onQtyChange(Math.max(1, qty - 1))}>
            <MaterialIcons name="remove" size={ms(18)} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.qtyValue, { color: colors.textPrimary }]}>{qty}</Text>
          <TouchableOpacity hitSlop={8} onPress={() => onQtyChange(qty + 1)}>
            <MaterialIcons name="add" size={ms(18)} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.ratingRow}>
        <MaterialIcons name="star" size={ms(15)} color={colors.star} />
        <Text style={[styles.ratingValue, { color: colors.primary }]}>{rating.toFixed(1)}</Text>
        <Text style={[styles.ratingMeta, { color: colors.textPrimary }]}>
          · {reviewCount} reseñas
        </Text>
      </View>
      <Text style={[styles.ratingMeta, { color: colors.textPrimary }]}>{stock} disponibles</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { gap: vs(10) },
  priceRow:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceCurrency: { fontSize: ms(11), fontWeight: "600" },
  priceAmount:   { fontSize: ms(28), fontWeight: "800", lineHeight: ms(34) },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(12),
    borderRadius: ms(999),
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
  },
  qtyValue:    { fontSize: ms(16), fontWeight: "700", minWidth: ms(16), textAlign: "center" },
  ratingRow:   { flexDirection: "row", alignItems: "center", gap: s(4) },
  ratingValue: { fontSize: ms(13), fontWeight: "700" },
  ratingMeta:  { fontSize: ms(12), opacity: 0.5 },
});