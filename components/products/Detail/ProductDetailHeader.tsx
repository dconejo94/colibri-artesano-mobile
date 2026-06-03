import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { getProductImage } from "@/utils/productImages";
import { ms, s, vs } from "@/utils/scale";
import { Image, StyleSheet, View } from "react-native";

type Props = { name: string; storeName: string; imageUrl: string; isDark: boolean };

export function ProductDetailHeader({ name, storeName, imageUrl, isDark }: Props) {
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <Image source={getProductImage(imageUrl)} style={styles.image} resizeMode="cover" />
      <View style={styles.titleBlock}>
        <ThemedText
          type="defaultSemiBold"
          numberOfLines={2}
          style={styles.name}
          lightColor={C.text}
          darkColor={C.text}
        >
          {name}
        </ThemedText>
        <ThemedText
          style={styles.artisan}
          lightColor={C.brandLight}
          darkColor={C.brandLight}
        >
          {storeName}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: s(16),
    paddingBottom: vs(12),
    gap: s(12),
  },
  image:      { width: ms(72), height: ms(72), borderRadius: ms(10) },
  titleBlock: { flex: 1, gap: vs(3) },
  name:       { fontSize: ms(16), lineHeight: ms(22) },
  artisan:    { fontSize: ms(12), fontStyle: "italic" },
});