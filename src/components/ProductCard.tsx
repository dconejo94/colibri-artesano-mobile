import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { fonts, useTheme } from '@/src/theme';
import { favoriteProduct, unfavoriteProduct } from '@/api/products';
import StatusBadge, { type BadgeStatus } from './StatusBadge';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Product {
  id:               string;
  name:             string;
  artisan:          string;
  storeId?:         string;   // enables the "view store" link on the artisan's name
  price:            number;
  currency:         string;
  imageUri:         string;
  status:           BadgeStatus;
  category:         string;
  shortDescription?: string;  // italic subtitle under the name
  isFavorite?:      boolean;
}

interface Props {
  product:  Product;
  onPress:  (id: string) => void;
  onObtain: (id: string) => void;  // "Obtener" button
  onArtisanPress?: (storeId: string) => void;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;  // notifies the parent after backend confirmation (e.g. to remove it from a favorites list)
  width?:   number;
}

// ─── Utility: artisan initials ────────────────────────────────────────
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function ProductCard({ product, onPress, onObtain, onArtisanPress, onFavoriteToggle, width }: Props) {
  const { colors, spacing, radii, shadows, text } = useTheme();
  const [isFav, setIsFav] = useState(!!product.isFavorite);

  // Re-sync when the underlying product identity/flag changes (e.g. the list
  // refetched) — a bare useState initializer would otherwise leave `isFav`
  // stuck at whatever it was on first mount.
  useEffect(() => {
    setIsFav(!!product.isFavorite);
  }, [product.id, product.isFavorite]);

  const safeCurrency = product.currency || 'CRC';
  const priceFormatted = new Intl.NumberFormat(
    safeCurrency === 'CRC' ? 'es-CR' : 'en-US',
    { style: 'currency', currency: safeCurrency, maximumFractionDigits: 0 },
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
      {/* ── Image + overlays ───────────────────────────────────────────────── */}
      <View style={{ borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, overflow: 'hidden' }}>
        <Image
          source={{ uri: product.imageUri }}
          style={[styles.image, { backgroundColor: colors.bgCardAlt }]}
          resizeMode="cover"
          accessibilityLabel={`Foto de ${product.name}`}
        />

        {/* Status badge — top left */}
        <View style={styles.badgeOverlay}>
          <StatusBadge status={product.status} />
        </View>

        {/* Heart — top right */}
        <Pressable
          style={[styles.heartBtn, { backgroundColor: colors.bgCard }]}
          onPress={async () => {
            const nextVal = !isFav;
            setIsFav(nextVal);
            try {
              if (nextVal) {
                await favoriteProduct(product.id);
              } else {
                await unfavoriteProduct(product.id);
              }
              // Only tell the parent once the backend confirms — e.g. so a
              // favorites list removes the row after an unfavorite, not before.
              onFavoriteToggle?.(product.id, nextVal);
            } catch {
              setIsFav(!nextVal); // revert on error
            }
          }}
          accessibilityLabel="Agregar a favoritos"
          accessibilityRole="button"
          hitSlop={8}
        >
          <MaterialIcons name={isFav ? "favorite" : "favorite-border"} size={18} color={colors.accent} />
        </Pressable>
      </View>

      {/* ── Information section ─────────────────────────────────────────── */}
      <View style={[styles.info, { padding: spacing[4] }]}>

        {/* Product name */}
        <Text
          style={[text.productName, { color: colors.textPrimary }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Short description in green italics — only if present */}
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

        {/* Artisan row: avatar + name + category */}
        <View style={[styles.artisanRow, { marginTop: spacing[3] }]}>
          {/* Circular avatar with initials */}
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

          <Pressable
            style={{ flex: 1 }}
            disabled={!product.storeId || !onArtisanPress}
            onPress={() => product.storeId && onArtisanPress?.(product.storeId)}
            hitSlop={4}
            accessibilityLabel={`Ver tienda de ${product.artisan}`}
            accessibilityRole={product.storeId && onArtisanPress ? 'button' : undefined}
          >
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
          </Pressable>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing[3] }]} />

        {/* Price + Obtener button */}
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
    aspectRatio: 4 / 3,  // slightly wider than tall — like the reference image
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
    // soft shadow so the circle stays legible over any image
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
