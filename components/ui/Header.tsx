import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/src/theme';

type Props = {
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onCartPress?: () => void;
  unreadCount?: number;
  cartCount?: number;
};

// Two logo variants — the source swaps based on isDark
const LOGO_LIGHT = require('@/assets/images/light_mode_logo.png');
const LOGO_DARK  = require('@/assets/images/dark_mode_logo.png');

export default function Header({ onMenuPress, onNotificationsPress, onCartPress, unreadCount, cartCount }: Props) {
  const { colors, spacing, isDark } = useTheme();
  const hasRightIcons = !!onNotificationsPress || !!onCartPress;

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
      {/* Hamburger menu icon */}
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

      {/* Centered logo — changes with the system theme */}
      <Image
        source={isDark ? LOGO_DARK : LOGO_LIGHT}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Logo de El Colibrí Artesano"
      />

      {/* Notifications + cart (optional, backwards-compatible) or spacer */}
      {hasRightIcons ? (
        <View style={styles.rightIcons}>
          {onNotificationsPress && (
            <TouchableOpacity
              onPress={onNotificationsPress}
              accessibilityLabel="Notificaciones"
              accessibilityRole="button"
              style={styles.iconButton}
            >
              <MaterialIcons name="notifications-none" size={24} color={colors.primary} />
              {!!unreadCount && (
                <View style={[styles.badge, { backgroundColor: colors.errorText }]}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {onCartPress && (
            <TouchableOpacity
              onPress={onCartPress}
              accessibilityLabel="Carrito"
              accessibilityRole="button"
              style={styles.iconButton}
            >
              <MaterialIcons name="shopping-cart" size={22} color={colors.primary} />
              {!!cartCount && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.badgeText, { color: colors.textOnPrimary }]}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.spacer} />
      )}
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
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
