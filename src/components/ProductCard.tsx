import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';
import StatusBadge, { type BadgeStatus } from './StatusBadge';

// ─── Tipos ───────────────────────────────────────────────────────────────────
export interface Product {
  id:       string;
  name:     string;
  artisan:  string;
  price:    number;
  currency: string;   // 'CRC', 'USD', etc.
  imageUri: string;
  status:   BadgeStatus;
  category: string;
}

interface Props {
  product: Product;
  onPress: (id: string) => void;
  width?:  number;  // pasado automáticamente por ProductList
}

// ─── Componente ──────────────────────────────────────────────────────────────
export default function ProductCard({ product, onPress, width }: Props) {
  const { colors, spacing, radii, shadows, text } = useTheme();

  // Formateo de precio en formato costarricense (₡18.500 / $12.50)
  const priceFormatted = new Intl.NumberFormat(
    product.currency === 'CRC' ? 'es-CR' : 'en-US',
    { style: 'currency', currency: product.currency, maximumFractionDigits: 0 },
  ).format(product.price);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          width:           width,
          backgroundColor: colors.bgCard,
          borderRadius:    radii.lg,
          borderColor:     colors.border,
          opacity:         pressed ? 0.88 : 1,
          ...shadows.sm,
        },
      ]}
      onPress={() => onPress(product.id)}
      accessibilityLabel={`${product.name} por ${product.artisan}, ${priceFormatted}`}
      accessibilityRole="button"
    >
      {/* Imagen cuadrada — siempre aspect 1:1 para mantener alineación de grilla */}
      <View style={{ borderRadius: radii.lg, overflow: 'hidden' }}>
        <Image
          source={{ uri: product.imageUri }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={`Foto de ${product.name}`}
        />
        {/* Badge superpuesto sobre la imagen */}
        <View style={styles.badgeOverlay}>
          <StatusBadge status={product.status} />
        </View>
      </View>

      {/* Info del producto */}
      <View style={[styles.info, { padding: spacing[3] }]}>
        {/* Categoría en uppercase */}
        <Text
          style={[text.caption, { color: colors.textMuted, letterSpacing: 0.8 }]}
          numberOfLines={1}
        >
          {product.category.toUpperCase()}
        </Text>

        {/* Nombre del producto — máx 2 líneas para no romper la grilla */}
        <Text
          style={[text.productName, { color: colors.textPrimary, marginTop: 2 }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Nombre del artesano — máx 1 línea */}
        <Text
          style={[text.label, { color: colors.primaryDeep, marginTop: 2 }]}
          numberOfLines={1}
        >
          {product.artisan}
        </Text>

        {/* Precio */}
        <Text
          style={[text.price, { color: colors.primary, marginTop: spacing[2] }]}
          numberOfLines={1}
        >
          {priceFormatted}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 0.5,
    overflow:    'hidden',
  },
  image: {
    width:       '100%',
    aspectRatio: 1,  // cuadrado — evita alturas variables en la grilla
  },
  badgeOverlay: {
    position: 'absolute',
    top:      8,
    left:     8,
  },
  info: {
    gap: 0,
  },
});
