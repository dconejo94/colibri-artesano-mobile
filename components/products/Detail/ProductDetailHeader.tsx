import { useTheme } from "@/src/theme";
import { ms, s, vs } from "@/utils/scale";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = { name: string; storeName: string; imageUrl?: string };

export function ProductDetailHeader({ name, storeName, imageUrl }: Props) {
  const { colors, text } = useTheme();

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholderImage, { backgroundColor: colors.bgCardAlt }]}>
          <MaterialIcons name="image" size={ms(28)} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.titleBlock}>
        <Text
          numberOfLines={2}
          style={[text.productName, { color: colors.textPrimary }]}
        >
          {name}
        </Text>
        <Text style={[text.label, { color: colors.textSecondary, fontStyle: "italic" }]}>
          {storeName}
        </Text>
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
  image:            { width: ms(72), height: ms(72), borderRadius: ms(10) },
  placeholderImage: { justifyContent: "center", alignItems: "center" },
  titleBlock:       { flex: 1, gap: vs(3) },
});