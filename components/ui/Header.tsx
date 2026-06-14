import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/src/theme';

type Props = {
  onMenuPress?: () => void;
};

// Logos en dos variantes — se cambia la fuente según isDark
const LOGO_LIGHT = require('@/assets/images/light_mode_logo.png');
const LOGO_DARK  = require('@/assets/images/dark_mode_logo.png');

export default function Header({ onMenuPress }: Props) {
  const { colors, spacing, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:  colors.bgNavbar,
          paddingHorizontal: spacing[4],
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Ícono de menú hamburguesa */}
      <TouchableOpacity
        onPress={onMenuPress}
        accessibilityLabel="Abrir menú de navegación"
        accessibilityRole="button"
      >
        <MaterialIcons
          name="menu"
          size={28}
          color={colors.primary}
        />
      </TouchableOpacity>

      {/* Logo centrado — cambia según el modo del sistema */}
      <Image
        source={isDark ? LOGO_DARK : LOGO_LIGHT}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Logo de El Colibrí Artesano"
      />

      {/* Espaciador para mantener el logo visualmente centrado */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width:          '100%',
    height:         64,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  logo: {
    height: 44,
    width:  160,
  },
  spacer: {
    width: 28,
  },
});
