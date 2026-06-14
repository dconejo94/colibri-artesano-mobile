// Main product info: name, artisan, price, and status badge.
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';
import StatusBadge, { type BadgeStatus } from '../StatusBadge';

interface Props {
  name:     string;
  artisan:  string;
  price:    number;
  currency: string;
  status:   BadgeStatus;
  category: string;
}

export default function DetailHeader({
  name,
  artisan,
  price,
  currency,
  status,
  category,
}: Props) {
  const { colors, spacing, text } = useTheme();

  const priceFormatted = new Intl.NumberFormat(
    currency === 'CRC' ? 'es-CR' : 'en-US',
    { style: 'currency', currency, maximumFractionDigits: 0 },
  ).format(price);

  return (
    <View style={[styles.container, { padding: spacing[4] }]}>
      {/* Category + badge on the same row */}
      <View style={styles.topRow}>
        <Text style={[text.caption, { color: colors.textMuted, letterSpacing: 0.8 }]}>
          {category.toUpperCase()}
        </Text>
        <StatusBadge status={status} />
      </View>

      {/* Product name */}
      <Text style={[text.h2, { color: colors.textPrimary, marginTop: spacing[2] }]}>
        {name}
      </Text>

      {/* Artisan name */}
      <Text style={[text.label, { color: colors.primaryDeep, marginTop: spacing[1] }]}>
        {artisan}
      </Text>

      {/* Price */}
      <Text style={[text.priceDetail, { color: colors.primary, marginTop: spacing[3] }]}>
        {priceFormatted}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  topRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
});
