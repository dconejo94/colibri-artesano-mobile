import { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, usePathname } from 'expo-router';
import { s, vs } from '@/utils/scale';
import { useTheme } from '@/src/theme';

// ─── Ancho del panel ─────────────────────────────────────────────────────────
const DRAWER_WIDTH = s(280);
const ANIM_DURATION = 280;

// ─── Datos del usuario (placeholder — reemplazar con contexto de auth) ───────
const USER = {
  initials: 'EG',
  name:     'Elena Gómez',
  role:     'Artesana',
  location: 'Heredia',
};

// ─── Items de navegación ─────────────────────────────────────────────────────
// icon: nombre de MaterialIcons, href: ruta de Expo Router
const NAV_ITEMS = [
  { label: 'Inicio',     icon: 'home'           as const, href: '/'          },
  { label: 'Productos',  icon: 'eco'            as const, href: '/productos'  },
  { label: 'Mi Tienda',  icon: 'storefront'     as const, href: '/tienda'    },
  { label: 'Eventos',    icon: 'event'          as const, href: '/eventos'   },
  { label: 'Carrito',    icon: 'shopping-cart'  as const, href: '/carrito'   },
  { label: 'Favoritos',  icon: 'favorite'       as const, href: '/favoritos' },
];

type Props = {
  isOpen:  boolean;
  onClose: () => void;
};

export default function HamburgerMenu({ isOpen, onClose }: Props) {
  const { colors, spacing, radii, text } = useTheme();
  const router   = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const translateX = useSharedValue(-DRAWER_WIDTH);

  // Maneja animación de entrada / salida
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      translateX.value = withTiming(0, { duration: ANIM_DURATION });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: ANIM_DURATION });
      const t = setTimeout(() => setVisible(false), ANIM_DURATION);
      return () => clearTimeout(t);
    }
  }, [isOpen, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Navega a la ruta y cierra el drawer
  const handleNav = (href: string) => {
    onClose();
    // Pequeño delay para dejar que la animación de cierre empiece
    setTimeout(() => router.push(href as any), 80);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop con tinte verde oscuro de la marca */}
      <Pressable
        style={[styles.backdrop, { backgroundColor: 'rgba(44,56,48,0.45)' }]}
        onPress={onClose}
        accessibilityLabel="Cerrar menú"
      />

      {/* Panel deslizable */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width:            DRAWER_WIDTH,
            backgroundColor:  colors.bgPage,
            paddingTop:       vs(56),
            paddingBottom:    vs(40),
            borderRightWidth: 0,
          },
          animatedStyle,
        ]}
      >
        {/* ── Perfil de usuario ──────────────────────────────────────────── */}
        <View style={[styles.profile, { paddingHorizontal: spacing[5] }]}>
          {/* Avatar circular con iniciales */}
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: colors.primary,
                borderRadius:    radii.full,
              },
            ]}
          >
            <Text style={[text.button, { color: colors.textOnPrimary, fontSize: 18 }]}>
              {USER.initials}
            </Text>
          </View>

          {/* Nombre y subtítulo */}
          <View style={{ flex: 1 }}>
            <Text style={[text.productName, { color: colors.textPrimary }]}>
              {USER.name}
            </Text>
            <Text style={[text.label, { color: colors.textSecondary, marginTop: 2 }]}>
              {USER.role} • {USER.location}
            </Text>
          </View>
        </View>

        {/* Separador */}
        <View
          style={[
            styles.divider,
            {
              backgroundColor:  colors.border,
              marginHorizontal: spacing[5],
              marginVertical:   vs(20),
            },
          ]}
        />

        {/* ── Links de navegación ───────────────────────────────────────── */}
        <View style={[styles.nav, { paddingHorizontal: spacing[4] }]}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Pressable
                key={item.href}
                style={({ pressed }) => [
                  styles.navItem,
                  {
                    backgroundColor: isActive
                      ? colors.bgSection
                      : pressed
                      ? colors.bgSection + '80'
                      : 'transparent',
                    borderRadius:    radii.md,
                    paddingVertical:   vs(14),
                    paddingHorizontal: spacing[4],
                    marginBottom:      vs(4),
                  },
                ]}
                onPress={() => handleNav(item.href)}
                accessibilityLabel={item.label}
                accessibilityRole="button"
              >
                <MaterialIcons
                  name={item.icon}
                  size={22}
                  color={isActive ? colors.primary : colors.primarySoft}
                />
                <Text
                  style={[
                    text.body,
                    {
                      color:      isActive ? colors.primary : colors.textPrimary,
                      fontFamily: isActive
                        ? 'DMSans_500Medium'
                        : 'DMSans_400Regular',
                      marginLeft: spacing[3],
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    position: 'absolute',
    left:     0,
    top:      0,
    bottom:   0,
  },
  profile: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  avatar: {
    width:           48,
    height:          48,
    alignItems:      'center',
    justifyContent:  'center',
  },
  divider: {
    height: 1,
  },
  nav: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems:    'center',
  },
});
