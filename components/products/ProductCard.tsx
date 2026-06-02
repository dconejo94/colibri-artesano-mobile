import { ThemedText } from "@/components/themed-text";
import { getProductImage } from "@/utils/productImages";
import { ms, s, vs } from "@/utils/scale";

import { Product } from "@/services/products";

import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type Props = {
  item: Product;
  width: number;
  onPress: () => void;
};

export function ProductCard({ item, width, onPress }: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <TouchableOpacity
      style={[styles.card, { width }, isDark ? styles.cardDark : styles.cardLight]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <Image
        source={getProductImage(item.image_url)}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.body}>
        <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.name}>
          {item.name}
        </ThemedText>
        <Text numberOfLines={2} style={styles.subtitle}>
          {item.description}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AR</Text>
        </View>
        <View style={styles.artisanInfo}>
          <Text style={styles.artisanName} numberOfLines={1}>Artesano</Text>
          <Text style={styles.artisanCategory} numberOfLines={1}>
            {item.category ?? "Artesanía"}
          </Text>
        </View>
        <View style={styles.obtenerBtn}>
          <Text style={styles.obtenerText}>Obtener</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const TEAL = "#82A8AC";
const TEAL_DARK = "#5C8A8F";
const AVATAR_BG = "#3E5F63";

const styles = StyleSheet.create({
  card: {
    borderRadius: ms(16),
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardLight: { backgroundColor: TEAL },
  cardDark:  { backgroundColor: TEAL_DARK },

  favBtn: {
    position: "absolute",
    top: s(8),
    right: s(8),
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: ms(20),
    padding: s(4),
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  image: {
    width: "100%",
    height: vs(160),
    borderRadius: ms(12),
    marginTop: vs(8),
    paddingHorizontal: s(8),
    // No overflow clip para ver el rounded
    alignSelf: "center",
  },

  body: {
    paddingHorizontal: s(12),
    paddingTop: vs(10),
    paddingBottom: vs(4),
    gap: vs(3),
  },

  name: {
    fontSize: ms(15),
    lineHeight: ms(20),
    color: "#fff",
  },

  subtitle: {
    fontSize: ms(12),
    lineHeight: ms(16),
    color: "rgba(255,255,255,0.85)",
    fontStyle: "italic",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: s(10),
    paddingVertical: vs(10),
    gap: s(8),
  },

  avatar: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    backgroundColor: AVATAR_BG,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: ms(12),
    fontWeight: "700",
  },

  artisanInfo: {
    flex: 1,
  },

  artisanName: {
    color: "#fff",
    fontSize: ms(12),
    fontWeight: "600",
    lineHeight: ms(16),
  },

  artisanCategory: {
    color: "rgba(255,255,255,0.75)",
    fontSize: ms(11),
    lineHeight: ms(14),
  },

  obtenerBtn: {
    backgroundColor: "#1A3336",
    paddingHorizontal: s(14),
    paddingVertical: vs(7),
    borderRadius: ms(20),
  },

  obtenerText: {
    color: "#fff",
    fontSize: ms(12),
    fontWeight: "600",
  },
});