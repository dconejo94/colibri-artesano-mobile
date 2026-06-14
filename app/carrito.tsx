import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';

export default function CarritoScreen() {
  const { colors, text, spacing } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[4] }}>
        <Text style={[text.h2, { color: colors.primaryDeep, textAlign: 'center' }]}>
          Carrito
        </Text>
        <Text style={[text.body, { color: colors.textSecondary, marginTop: spacing[3], textAlign: 'center' }]}>
          Próximamente disponible.
        </Text>
      </View>
    </SafeAreaView>
  );
}
