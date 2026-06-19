import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { fonts, useTheme } from '@/src/theme';
import StatusBadge, { type BadgeStatus } from './StatusBadge';

// ─── Tipos ───────────────────────────────────────────────────────────────────
export interface Product {
  id:               string;
  name:             string;
  artisan:          string;
  price:            number;
  currency:         string;
  imageUri:         string;
  status:           BadgeStatus;
  category:         string;
  shortDescription?: string;  // subtítulo italic bajo el nombre
}

interface Props {
  product:  Product;
  onPress:  (id: string) => void;
  onObtain: (id: string) => void;  // botón "Obtener"
  width?:   number;
}

// ─── Utilidad: iniciales del artesano ────────────────────────────────────────
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ─── Componente ──────────────────────────────────────────────────────────────
export default function ProductCard({ product, onPress, onObtain, width }: Props) {
  const { colors, spacing, radii, shadows, text } = useTheme();

  const priceFormatted = new Intl.NumberFormat(
    product.currency === 'CRC' ? 'es-CR' : 'en-US',
    { style: 'currency', currency: product.currency, maximumFractionDigits: 0 },
  ).format(product.price);

  const initials = getInitials(product.artisan);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          width:           width,
          backgroundColor: colors.bgCard,
          borderRadius:    radii.lg,
          opacity:         pressed ? 0.95 : 1,
          ...shadows.md,
        },
      ]}
      onPress={() => onPress(product.id)}
      accessibilityLabel={`${product.name} por ${product.artisan}, ${priceFormatted}`}
      accessibilityRole="button"
    >
      {/* ── Imagen + overlays ───────────────────────────────────────────────── */}
      <View style={{ borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, overflow: 'hidden' }}>
        <Image
          source={{ uri: product.imageUri }}
          style={[styles.image, { backgroundColor: colors.bgCardAlt }]}
          resizeMode="cover"
          accessibilityLabel={`Foto de ${product.name}`}
        />

        {/* Badge de estado — top left */}
        <View style={styles.badgeOverlay}>
          <StatusBadge status={product.status} />
        </View>

        {/* Corazón — top right */}
        <Pressable
          style={[styles.heartBtn, { backgroundColor: colors.bgCard }]}
          onPress={() => {}}
          accessibilityLabel="Agregar a favoritos"
          accessibilityRole="button"
          hitSlop={8}
        >
          <MaterialIcons name="favorite-border" size={18} color={colors.accent} />
        </Pressable>
      </View>

      {/* ── Sección de información ─────────────────────────────────────────── */}
      <View style={[styles.info, { padding: spacing[4] }]}>

        {/* Nombre del producto */}
        <Text
          style={[text.productName, { color: colors.textPrimary }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Descripción corta en itálica verde — solo si está presente */}
        {product.shortDescription && (
          <Text
            style={[
              text.body,
              {
                color:      colors.primary,
                fontFamily: fonts.serifItalic,
                fontSize:   13,
                marginTop:  4,
                lineHeight: 18,
              },
            ]}
            numberOfLines={2}
          >
            {product.shortDescription}
          </Text>
        )}

        {/* Fila del artesano: avatar + nombre + categoría */}
        <View style={[styles.artisanRow, { marginTop: spacing[3] }]}>
          {/* Avatar circular con iniciales */}
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: colors.primaryDeep,
                borderRadius:    radii.sm,
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: colors.textOnPrimary }]}>
              {initials}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={[text.label, { color: colors.textPrimary, fontFamily: fonts.sanBold }]}
              numberOfLines={1}
            >
              {product.artisan}
            </Text>
            <Text
              style={[text.caption, { color: colors.textSecondary, marginTop: 1 }]}
              numberOfLines={1}
            >
              Artesano • {product.category}
            </Text>
          </View>
        </View>

        {/* Separador */}
        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing[3] }]} />

        {/* Precio + botón Obtener */}
        <View style={styles.bottomRow}>
          <Text style={[text.priceDetail, { color: colors.primary, fontSize: 18 }]}>
            {priceFormatted}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.obtenerBtn,
              {
                backgroundColor: product.status === 'sold_out'
                  ? colors.border
                  : colors.btnPrimaryBg,
                borderRadius:    radii.full,
                opacity:         pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => onObtain(product.id)}
            disabled={product.status === 'sold_out'}
            accessibilityLabel={product.status === 'sold_out' ? 'Agotado' : 'Obtener producto'}
            accessibilityRole="button"
          >
            <Text style={[text.button, { color: colors.btnPrimaryText, fontSize: 14 }]}>
              {product.status === 'sold_out' ? 'Agotado' : 'Obtener'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  image: {
    width:       '100%',
    aspectRatio: 4 / 3,  // ligeramente más ancho que alto — como en la imagen de referencia
  },
  badgeOverlay: {
    position: 'absolute',
    top:      10,
    left:     10,
  },
  heartBtn: {
    position:       'absolute',
    top:            10,
    right:          10,
    width:          34,
    height:         34,
    borderRadius:   17,
    alignItems:     'center',
    justifyContent: 'center',
    // sombra suave para que el círculo se lea sobre cualquier imagen
    shadowColor:    '#2C3830',
    shadowOffset:   { width: 0, height: 1 },
    shadowOpacity:  0.1,
    shadowRadius:   3,
    elevation:      2,
  },
  info: {},
  artisanRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  avatar: {
    width:          36,
    height:         36,
    alignItems:     'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize:   13,
    fontFamily: fonts.sanBold,
  },
  divider: {
    height: 0.5,
  },
  bottomRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  obtenerBtn: {
    paddingVertical:   10,
    paddingHorizontal: 20,
  },
});
