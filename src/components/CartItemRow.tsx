import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/src/theme';
import { formatPrice } from '@/utils/format';
import type { CartItem } from '@/types/cart';

interface Props {
  item: CartItem;
  disabled?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export default function CartItemRow({ item, disabled, onIncrement, onDecrement, onRemove }: Props) {
  const { colors, radii, text } = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg }]}>
      <Image
        source={{ uri: item.product_image_url ?? 'https://via.placeholder.com/150' }}
        style={[styles.image, { borderRadius: radii.md, backgroundColor: colors.bgCardAlt }]}
      />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={[text.label, { color: colors.textPrimary, fontWeight: '700', flex: 1 }]} numberOfLines={2}>
            {item.product_name}
          </Text>
          <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel="Quitar del carrito" accessibilityRole="button">
            <MaterialIcons name="delete-outline" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        {!!item.variant_value && (
          <Text style={[text.caption, { color: colors.textMuted, marginTop: 2 }]}>{item.variant_value}</Text>
        )}

        <View style={styles.bottomRow}>
          <View style={[styles.stepper, { borderColor: colors.border }]}>
            <Pressable
              onPress={onDecrement}
              disabled={disabled}
              style={[styles.stepperBtn, { backgroundColor: colors.bgSection }]}
              accessibilityLabel="Disminuir cantidad"
              accessibilityRole="button"
            >
              <MaterialIcons name="remove" size={16} color={colors.primary} />
            </Pressable>
            <Text style={[text.label, { color: colors.textPrimary, minWidth: 20, textAlign: 'center' }]}>
              {item.quantity}
            </Text>
            <Pressable
              onPress={onIncrement}
              disabled={disabled}
              style={[styles.stepperBtn, { backgroundColor: colors.bgSection }]}
              accessibilityLabel="Aumentar cantidad"
              accessibilityRole="button"
            >
              <MaterialIcons name="add" size={16} color={colors.primary} />
            </Pressable>
          </View>
          <Text style={[text.label, { color: colors.textPrimary, fontWeight: '700' }]}>
            {formatPrice(item.subtotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 13,
    padding: 12,
    borderWidth: 0.5,
  },
  image: {
    width: 74,
    height: 74,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 11,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
