import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';
import { formatCurrency } from '@/utils/currency';

export type OrderItem = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  quantity: number;
};

type Props = {
  item: OrderItem;
  currency: string;
};

export default function OrderSummaryCard({ item, currency }: Props) {
  const { colors, radii, spacing, text, shadows } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderRadius: radii.md,
          padding: spacing[3],
          gap: spacing[3],
          ...shadows.sm,
        },
      ]}
    >
      <Image source={{ uri: item.imageUrl }} style={[styles.image, { borderRadius: radii.sm }]} />
      <View style={styles.info}>
        <Text style={[text.body, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[text.label, { color: colors.textPrimary, marginTop: 6 }]}>
          {formatCurrency(item.price, currency)}
        </Text>
      </View>
      <View style={styles.qty}>
        <Text style={[text.caption, { color: colors.textMuted }]}>Cantidad</Text>
        <Text style={[text.label, { color: colors.textPrimary }]}>{item.quantity}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 56,
    height: 56,
  },
  info: { flex: 1 },
  qty: { alignItems: 'flex-end' },
});
