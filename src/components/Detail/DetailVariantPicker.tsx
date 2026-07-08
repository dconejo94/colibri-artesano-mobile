// Variant selector — required whenever a product has more than one variant,
// since the backend has no "default" variant to fall back to in that case
// (POST /cart/item 409s without an explicit variant_id).
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';
import type { ProductVariant } from '@/types/store';

interface Props {
  variants: ProductVariant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function DetailVariantPicker({ variants, selectedId, onSelect }: Props) {
  const { colors, spacing, radii, text } = useTheme();

  // A single (or no) variant needs no picker — it's already selected/implicit.
  if (variants.length <= 1) return null;

  const axisName = variants[0]?.name;

  return (
    <View style={{ paddingHorizontal: spacing[4], marginTop: spacing[3] }}>
      {!!axisName && (
        <Text style={[text.label, { color: colors.textPrimary, marginBottom: spacing[2] }]}>
          {axisName}
        </Text>
      )}
      <View style={styles.row}>
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          const isOutOfStock = Number(variant.stock_quantity) <= 0;
          return (
            <Pressable
              key={variant.id}
              onPress={() => onSelect(variant.id)}
              disabled={isOutOfStock}
              style={[
                styles.chip,
                {
                  borderRadius: radii.md,
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primary + '1F' : colors.bgCard,
                  opacity: isOutOfStock ? 0.5 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${axisName ?? 'Variante'} ${variant.value}${isOutOfStock ? ', agotado' : ''}`}
              accessibilityState={{ selected: isSelected, disabled: isOutOfStock }}
            >
              <Text style={[text.label, { color: isSelected ? colors.primary : colors.textPrimary }]}>
                {variant.value}
                {isOutOfStock ? ' (agotado)' : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
});
