import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Button from '@/components/ui/Button';
import { useTheme, spacing } from '@/src/theme';

export default function OrderConfirmationScreen() {
  const { colors, text } = useTheme();
  const router = useRouter();

  const {
    orderId,
    total,
    date,
  } = useLocalSearchParams<{
    orderId?: string;
    total?: string;
    date?: string;
  }>();

  const formattedDate = date
    ? new Date(date).toLocaleDateString('es-CR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'No disponible';

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPage,
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialIcons
          name="check-circle"
          size={80}
          color={colors.primary}
        />

        <Text
          style={[
            text.h2,
            {
              color: colors.textPrimary,
              marginTop: spacing[3],
            },
          ]}
        >
          ¡Compra exitosa!
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}
        >
          <Row
            label="Número de orden"
            value={orderId ?? 'No disponible'}
          />

          <Row
            label="Fecha"
            value={formattedDate}
          />

          <Row
            label="Total"
            value={total ?? 'No disponible'}
          />

          <Row
            label="Estado"
            value="Pago confirmado"
          />

          <Row
            label="Entrega"
            value="Por definir"
          />
        </View>
      </View>

      <Button
        title="Volver al inicio"
        onPress={() => router.replace('/')}
      />
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { colors, fonts } = useTheme();

  return (
    <View style={styles.row}>
      <Text
        style={{
          color: colors.textMuted,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: colors.textPrimary,
          fontFamily: fonts.sanMedium,
          flex: 1,
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing[5],
  },

  content: {
    alignItems: 'center',
    gap: spacing[6],
  },

  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing[4],
    gap: spacing[3],
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
