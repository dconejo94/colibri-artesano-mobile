// Sticky action bar (Buy now + Add to cart).
// Uses SafeAreaView to render above the home indicator.
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import { type BadgeStatus } from '../StatusBadge';

interface Props {
  productId: string;
  status:    BadgeStatus;
  disabled?:   boolean;  // ej. falta elegir variante
  onBuyNow:    (id: string) => void;
  onAddToCart: (id: string) => void;
}

export default function DetailActionBar({
  productId,
  status,
  disabled,
  onBuyNow,
  onAddToCart,
}: Props) {
  const { colors, spacing, radii, shadows, text } = useTheme();
  const insets = useSafeAreaInsets();

  const isSoldOut = status === 'sold_out';
  const isBlocked = isSoldOut || disabled;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.bgCard,
          paddingHorizontal: spacing[4],
          paddingTop:        spacing[3],
          paddingBottom:     Math.max(insets.bottom, spacing[4]),
          borderTopWidth:    0.5,
          borderTopColor:    colors.border,
          ...shadows.lg,
        },
      ]}
    >
      {/* Secondary button: Add to cart (flex: 1) */}
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          {
            flex:            1,
            backgroundColor: colors.btnSecondaryBg,
            borderRadius:    radii.md,
            borderWidth:     1,
            borderColor:     colors.btnSecondaryBorder,
            opacity:         isBlocked || pressed ? 0.6 : 1,
          },
        ]}
        onPress={() => onAddToCart(productId)}
        disabled={isBlocked}
        accessibilityLabel="Agregar al carrito"
        accessibilityRole="button"
      >
        <Text style={[text.button, { color: colors.btnSecondaryText }]}>
          Al carrito
        </Text>
      </Pressable>

      {/* Primary button: Buy now (flex: 1.6 — more prominent) */}
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          {
            flex:            1.6,
            backgroundColor: colors.btnPrimaryBg,
            borderRadius:    radii.md,
            opacity:         isBlocked || pressed ? 0.6 : 1,
          },
        ]}
        onPress={() => onBuyNow(productId)}
        disabled={isBlocked}
        accessibilityLabel={isSoldOut ? 'Producto agotado' : disabled ? 'Elige una variante primero' : 'Comprar ahora'}
        accessibilityRole="button"
      >
        <Text style={[text.button, { color: colors.btnPrimaryText }]}>
          {isSoldOut ? 'Agotado' : disabled ? 'Elige una opción' : 'Comprar ahora'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap:           10,
  },
  btn: {
    height:          48,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 12,
  },
});
