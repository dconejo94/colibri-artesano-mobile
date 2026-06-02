import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Product } from "@/types/store";
import { formatPrice } from "@/utils/format";
import { ms, s, vs } from "@/utils/scale";
import { useRouter } from "expo-router";
import { Image, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";

type Props = {
  item: Product;
  width: number;
};

export function ProductCard({ item, width }: Props) {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  // Get primary image or first image, fallback to placeholder URL if none
  const primaryImage = item.images?.find((img) => img.is_primary)?.image_url 
    ?? item.images?.[0]?.image_url 
    ?? "https://via.placeholder.com/150";

  return (
    <TouchableOpacity
      style={[styles.card, { width }, isDark ? styles.cardDark : styles.cardLight]}
      activeOpacity={0.85}
      onPress={() => router.push(`/products/${item.id}`)}
    >
      <Image
        source={{ uri: primaryImage }}
        style={styles.image}
        resizeMode="cover"
      />
      <ThemedView style={styles.body}>
        <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.name}>
          {item.name}
        </ThemedText>
        <ThemedText type="default" numberOfLines={2} style={styles.desc}>
          {item.description}
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.price}>
          {formatPrice(item.base_price)}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: ms(12),
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardLight: { backgroundColor: "#fff" },
  cardDark:  { backgroundColor: "#1A1A1A" },
  image: {
    width: "100%",
    height: vs(130),
  },
  body: {
    padding: s(10),
    gap: vs(4),
    backgroundColor: "transparent",
  },
  name: {
    fontSize: ms(14),
    lineHeight: ms(18),
  },
  desc: {
    fontSize: ms(12),
    lineHeight: ms(16),
    opacity: 0.6,
  },
  price: {
    fontSize: ms(14),
    marginTop: vs(4),
    color: "#6B9E98",
  },
});
