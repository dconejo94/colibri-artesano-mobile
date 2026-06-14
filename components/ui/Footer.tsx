import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';

export default function Footer() {
  const { colors, spacing, text } = useTheme();
  const insets = useSafeAreaInsets();

  const MENU_ITEMS = [
    { icon: 'inventory-2' as const,  label: 'Mis pedidos'         },
    { icon: 'cancel' as const,       label: 'Eliminar cuenta'      },
    { icon: 'translate' as const,    label: 'Idioma'               },
    { icon: 'lock' as const,         label: 'Cambiar contraseña'   },
    { icon: 'person' as const,       label: 'Datos personales'     },
    { icon: 'logout' as const,       label: 'Cerrar sesión'        },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgSection,
          padding:         spacing[4],
          gap:             spacing[3],
          paddingBottom:   Math.max(insets.bottom, spacing[4]),
          borderTopWidth:  0.5,
          borderTopColor:  colors.border,
        },
      ]}
    >
      <Text style={[text.h3, { color: colors.primaryDeep }]}>Cuenta</Text>

      <View style={styles.grid}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => {}}
            accessibilityLabel={item.label}
            accessibilityRole="button"
          >
            <MaterialIcons name={item.icon} size={20} color={colors.primary} />
            <Text style={[text.body, { color: colors.textPrimary }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
  },
  item: {
    width:          '50%',
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
    paddingVertical: 10,
  },
});
