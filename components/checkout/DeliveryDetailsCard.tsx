import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';
import EditableCard from './EditableCard';

export type Address = {
  label: string;
  detail: string;
  estimatedDelivery: string;
};

type Props = {
  address: Address;
  onEdit: () => void;
};

export default function DeliveryDetailsCard({ address, onEdit }: Props) {
  const { colors, radii, spacing, text, shadows } = useTheme();

  return (
    <View style={{ gap: spacing[2] }}>
      <EditableCard onEdit={onEdit}>
        <Text style={[text.label, { color: colors.textPrimary }]}>{address.label}</Text>
        <Text style={[text.caption, { color: colors.textMuted, marginTop: 2 }]}>
          {address.detail}
        </Text>
      </EditableCard>

      <View
        style={[
          styles.estimateBox,
          { backgroundColor: colors.bgCard, borderRadius: radii.md, padding: spacing[3], ...shadows.sm },
        ]}
      >
        <Text style={[text.caption, { color: colors.textMuted }]}>
          Entrega prevista: {address.estimatedDelivery}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  estimateBox: {},
});