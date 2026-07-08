import { fonts, useTheme } from '@/src/theme';
import { useAuthStore } from '@/src/auth/authStore';
import { useCartStore } from '@/src/store/cartStore';
import { useNotificationsStore } from '@/src/store/notificationsStore';
import type { User } from '@/types/user';
import { s, vs } from '@/utils/scale';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// ─── Ancho del panel ─────────────────────────────────────────────────────────
const DRAWER_WIDTH = s(280);
const ANIM_DURATION = 280;

const ROLE_LABELS: Record<User['role'], string> = {
  buyer:  'Comprador',
  vendor: 'Vendedor',
};

// Derive the avatar/name/role shown in the drawer from the authenticated user.
function toDisplayUser(user: User | null) {
  if (!user) return { initials: '?', name: 'Usuario', role: undefined as string | undefined };
  const name = user.name?.trim() || user.email.split('@')[0];
  const initials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '?';
  return { initials, name, role: ROLE_LABELS[user.role] };
}

// ─── Items de navegación ─────────────────────────────────────────────────────
// icon: nombre de MaterialIcons, href: ruta de Expo Router
// requiresManage: solo se muestra a vendedores/admin (gestión de eventos)
const NAV_ITEMS = [
  { label: 'Inicio',            icon: 'home'           as const, href: '/'               },
  { label: 'Productos',         icon: 'eco'            as const, href: '/productos'      },
  { label: 'Mi Tienda',         icon: 'storefront'     as const, href: '/store'           },
  { label: 'Buscar',            icon: 'search'         as const, href: '/buscar'          },
  { label: 'Eventos',           icon: 'event'          as const, href: '/eventos'         },
  { label: 'Gestionar eventos', icon: 'tune'           as const, href: '/eventos/admin', requiresManage: true },
  { label: 'Notificaciones',    icon: 'notifications'  as const, href: '/notificaciones'  },
  { label: 'Carrito',           icon: 'shopping-cart'  as const, href: '/carrito'         },
  { label: 'Favoritos',         icon: 'favorite'       as const, href: '/favoritos'       },
  { label: 'Emprendedores',     icon: 'people'         as const, href: '/emprendedores'   },
  { label: 'Mi Perfil',         icon: 'person'         as const, href: '/perfil'          },
];

type Props = {
  isOpen:  boolean;
  onClose: () => void;
};

export default function HamburgerMenu({ isOpen, onClose }: Props) {
  const { colors, spacing, radii, text } = useTheme();
  const user     = useAuthStore((state) => state.user);
  const logout   = useAuthStore((state) => state.logout);
  const displayUser = toDisplayUser(user);
  const router   = useRouter();
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.count);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const canManageEvents = !!user?.is_admin;
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.requiresManage || canManageEvents);

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

  // Logs out: useAuthRedirect in _layout handles the redirect to /login once
  // the status flips to 'anonymous'.
  const handleLogout = () => {
    onClose();
    logout();
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
        <Pressable
          style={[styles.profile, { paddingHorizontal: spacing[5] }]}
          onPress={() => handleNav('/perfil')}
          accessibilityLabel="Ir a mi perfil"
          accessibilityRole="button"
        >
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
              {displayUser.initials}
            </Text>
          </View>

          {/* Nombre y subtítulo */}
          <View style={{ flex: 1 }}>
            <Text style={[text.productName, { color: colors.textPrimary }]}>
              {displayUser.name}
            </Text>
            <Text style={[text.label, { color: colors.textSecondary, marginTop: 2 }]}>
              {displayUser.role}
            </Text>
          </View>
        </Pressable>

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
        <ScrollView style={styles.nav} contentContainerStyle={{ paddingHorizontal: spacing[4], paddingBottom: vs(16) }}>
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            const badgeCount =
              item.href === '/carrito' ? cartCount : item.href === '/notificaciones' ? unreadCount : 0;

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
                        ? fonts.sanMedium
                        : fonts.sanRegular,
                      marginLeft: spacing[3],
                      flex: 1,
                    },
                  ]}
                >
                  {item.label}
                </Text>
                {badgeCount > 0 && (
                  <View
                    style={[
                      styles.navBadge,
                      {
                        backgroundColor: item.href === '/notificaciones' ? colors.errorText : colors.primary,
                        borderRadius: radii.full,
                      },
                    ]}
                  >
                    <Text style={[styles.navBadgeText, { color: colors.textOnPrimary }]}>
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Log out ───────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: spacing[4] }}>
          <View
            style={[
              styles.divider,
              { backgroundColor: colors.border, marginBottom: vs(8) },
            ]}
          />
          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              {
                backgroundColor:   pressed ? colors.errorBg : 'transparent',
                borderRadius:      radii.md,
                paddingVertical:   vs(14),
                paddingHorizontal: spacing[4],
              },
            ]}
            onPress={handleLogout}
            accessibilityLabel="Cerrar sesión"
            accessibilityRole="button"
          >
            <MaterialIcons name="logout" size={22} color={colors.errorText} />
            <Text
              style={[
                text.body,
                {
                  color:      colors.errorText,
                  fontFamily: fonts.sanMedium,
                  marginLeft: spacing[3],
                },
              ]}
            >
              Cerrar sesión
            </Text>
          </Pressable>
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
  navBadge: {
    minWidth:          20,
    height:            20,
    paddingHorizontal: 6,
    alignItems:        'center',
    justifyContent:    'center',
  },
  navBadgeText: {
    fontSize:   11,
    fontWeight: '700',
  },
});
