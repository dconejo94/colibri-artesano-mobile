import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/src/theme';

type Props = {
  children: React.ReactNode;
  onEdit: () => void;
};

export default function EditableCard({ children, onEdit }: Props) {
  const { colors, radii, spacing, shadows } = useTheme();

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
      <View style={{ flex: 1 }}>{children}</View>
      <MaterialIcons
        name="edit"
        size={20}
        color={colors.textPrimary}
        onPress={onEdit}
        suppressHighlighting
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});