import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme, spacing } from '@/src/theme';
import type { CartStoreGroup } from '@/types/cart';

type Props = {
  store: CartStoreGroup;
};

export default function CartSummaryCard({ store }: Props) {
  const { colors, text } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgSurface,
        },
      ]}
    >
      <Text style={[text.label, { color: colors.textPrimary }]}>
        {store.store_name}
      </Text>

      {store.items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Image
            source={{
              uri:
                item.product_image_url ??
                'https://via.placeholder.com/80',
            }}
            style={styles.image}
          />

          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={2}
              style={[text.body, { color: colors.textPrimary }]}
            >
              {item.product_name}
            </Text>

            {item.variant_name && (
              <Text
                style={[
                  text.caption,
                  { color: colors.textSecondary },
                ]}
              >
                {item.variant_name}
                {item.variant_value
                  ? ` • ${item.variant_value}`
                  : ''}
              </Text>
            )}

            <Text
              style={[
                { color: colors.primary },
              ]}
            >
              CRC {Number(item.unit_price).toLocaleString()}
            </Text>
          </View>

          <Text style={[text.body, { color: colors.textPrimary }]}>
            x{item.quantity}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: spacing[4],
    gap: spacing[3],
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
});