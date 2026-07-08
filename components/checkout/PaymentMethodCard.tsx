import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/src/theme';
import EditableCard from '@/components/checkout/EditableCard';

export type SavedPaymentMethod = {
  brand: 'visa' | 'mastercard' | string;
  last4: string;
};

type Props = {
  paymentMethod: SavedPaymentMethod;
  onEdit: () => void;
};

export default function PaymentMethodCard({ paymentMethod, onEdit }: Props) {
  const { colors, text } = useTheme();

  return (
    <EditableCard onEdit={onEdit}>
      <View style={styles.row}>
        <MaterialIcons name="credit-card" size={20} color={colors.textPrimary} />
        <Text style={[text.label, { color: colors.textPrimary }]}>
          {paymentMethod.brand.toUpperCase()} •••• {paymentMethod.last4}
        </Text>
      </View>
    </EditableCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});