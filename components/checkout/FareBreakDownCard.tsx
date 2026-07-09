import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';
import { formatCurrency } from '@/utils/currency';

type FareRowProps = {
  label: string;
  sublabel?: string;
  value: string;
  bold?: boolean;
};

function FareRow({ label, sublabel, value, bold }: FareRowProps) {
  const { colors, text } = useTheme();

  return (
    <View style={styles.row}>
      <View>
        <Text style={[bold ? text.label : text.body, { color: colors.textPrimary }]}>{label}</Text>
        {sublabel ? (
          <Text style={[text.caption, { color: colors.textMuted }]}>{sublabel}</Text>
        ) : null}
      </View>
      <Text style={[bold ? text.label : text.body, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

type Props = {
  subtotal: number;
  shippingFee: number;
  shippingCarrier: string;
  total: number;
  currency: string;
};

export default function FareBreakdownCard({
  subtotal,
  shippingFee,
  shippingCarrier,
  total,
  currency,
}: Props) {
  const { colors, radii, spacing, shadows } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.bgCard, borderRadius: radii.md, padding: spacing[3], ...shadows.sm },
      ]}
    >
      <FareRow label="Articulo(s)" value={formatCurrency(subtotal, currency)} />
      <FareRow label="Envío" sublabel={shippingCarrier} value={formatCurrency(shippingFee, currency)} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <FareRow label="Total" value={formatCurrency(total, currency)} bold />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
});
