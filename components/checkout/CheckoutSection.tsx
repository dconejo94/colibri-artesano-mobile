import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/src/theme';

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function CheckoutSection({ title, children }: Props) {
  const { colors, text } = useTheme();

  return (
    <View>
      <Text style={[text.label, { color: colors.textPrimary, marginBottom: 8 }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}
