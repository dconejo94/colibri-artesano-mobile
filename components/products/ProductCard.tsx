import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Product } from "@/services/products";
import { getProductImage } from "@/utils/productImages";
import { ms, s, vs } from "@/utils/scale";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View,
} from "react-native";

type Props = { item: Product; width: number; onPress: () => void };

export function ProductCard({ item, width, onPress }: Props) {
  const isDark = useColorScheme() === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={[styles.card, { width, backgroundColor: C.headerBg }]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={[styles.favBtn, { backgroundColor: C.background }]}>
        <MaterialIcons name="star" size={ms(18)} color={C.star} />
      </View>

      <Image
        source={getProductImage(item.image_url)}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.body}>
        <ThemedText
          type="defaultSemiBold"
          numberOfLines={2}
          style={styles.name}
          lightColor={C.textOnBrand}
          darkColor={C.textOnBrand}
        >
          {item.name}
        </ThemedText>
        <Text numberOfLines={2} style={[styles.subtitle, { color: C.textOnBrandMuted }]}>
          {item.description}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={[styles.avatar, { backgroundColor: C.brand }]}>
          <Text style={[styles.avatarText, { color: C.textOnBrand }]}>AR</Text>
        </View>

        <View style={styles.artisanInfo}>
          <Text style={[styles.artisanName, { color: C.textOnBrand }]} numberOfLines={1}>
            Artesano
          </Text>
          <Text style={[styles.artisanCategory, { color: C.textOnBrandMuted }]} numberOfLines={1}>
            {item.category ?? "Artesanía"}
          </Text>
        </View>

        <View style={[styles.obtenerBtn, { backgroundColor: C.brandDeep }]}>
          <Text style={[styles.obtenerText, { color: C.textOnBrand }]}>Obtener</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: ms(16),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  favBtn: {
    position: "absolute",
    top: s(8), right: s(8),
    zIndex: 10,
    borderRadius: ms(999),
    padding: s(4),
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: "100%",
    height: vs(160),
    borderRadius: ms(12),
    marginTop: vs(8),
    alignSelf: "center",
  },
  body: {
    paddingHorizontal: s(12),
    paddingTop: vs(10),
    paddingBottom: vs(4),
    gap: vs(3),
  },
  name:     { fontSize: ms(15), lineHeight: ms(20) },
  subtitle: { fontSize: ms(12), lineHeight: ms(16), fontStyle: "italic" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: s(10),
    paddingVertical: vs(10),
    gap: s(8),
  },
  avatar: {
    width: ms(34), height: ms(34),
    borderRadius: ms(999),
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText:      { fontSize: ms(12), fontWeight: "700" },
  artisanInfo:     { flex: 1 },
  artisanName:     { fontSize: ms(12), fontWeight: "600", lineHeight: ms(16) },
  artisanCategory: { fontSize: ms(11), lineHeight: ms(14) },
  obtenerBtn: {
    paddingHorizontal: s(14),
    paddingVertical: vs(7),
    borderRadius: ms(999),
  },
  obtenerText: { fontSize: ms(12), fontWeight: "600" },
});