// Compact product row for preview feeds (e.g. Home) — a simpler stand-in for
// the rich ProductCard, same style as the product rows in MyStoreScreen.
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';
import type { Product } from './ProductCard';

interface Props {
  product: Product;
  onPress: (id: string) => void;
}

export default function ProductPill({ product, onPress }: Props) {
  const { colors, radii, text } = useTheme();

  const priceFormatted = new Intl.NumberFormat(
    product.currency === 'CRC' ? 'es-CR' : 'en-US',
    { style: 'currency', currency: product.currency, maximumFractionDigits: 0 },
  ).format(product.price);

  return (
    <Pressable
      onPress={() => onPress(product.id)}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg, opacity: pressed ? 0.9 : 1 },
      ]}
      accessibilityLabel={`${product.name}, ${priceFormatted}`}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: product.imageUri }}
        style={[styles.thumb, { borderRadius: radii.md, backgroundColor: colors.bgCardAlt }]}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={[text.label, { color: colors.textPrimary, fontWeight: '700' }]} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={[text.caption, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={1}>
          {product.artisan}
        </Text>
        <Text style={[text.label, { color: colors.primary, fontWeight: '700', marginTop: 3 }]}>
          {priceFormatted}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderWidth: 0.5,
  },
  thumb: {
    width: 56,
    height: 56,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
});
