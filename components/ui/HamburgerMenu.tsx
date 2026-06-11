import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { s, vs, ms } from '@/utils/scale';
import { useTheme } from '@/src/theme';

const DRAWER_WIDTH = s(264);

const NAV_LINKS = [
  'Productos',
  'Marcas Aliadas',
  'Contacto',
  'Blog y novedades',
  'Eventos',
];

type Props = {
  isOpen:  boolean;
  onClose: () => void;
};

export default function HamburgerMenu({ isOpen, onClose }: Props) {
  const { colors, spacing } = useTheme();

  const [visible, setVisible] = useState(false);
  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      translateX.value = withTiming(0, { duration: 300 });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 300 });
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop con tinte verde oscuro de la marca, no negro genérico */}
        <Pressable
          style={[styles.backdrop, { backgroundColor: 'rgba(44,56,48,0.5)' }]}
          onPress={onClose}
          accessibilityLabel="Cerrar menú"
        />

        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor:  colors.bgNavbar,
              borderRightWidth: 0.5,
              borderRightColor: colors.border,
              paddingTop:       vs(60),
              paddingHorizontal: s(20),
              paddingBottom:    vs(24),
            },
            animatedStyle,
          ]}
        >
          {/* Íconos de acción superiores */}
          <View style={styles.iconsRow}>
            <TouchableOpacity
              onPress={() => {}}
              accessibilityLabel="Mi perfil"
              accessibilityRole="button"
            >
              <MaterialIcons name="person" size={ms(45)} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {}}
              accessibilityLabel="Mi carrito"
              accessibilityRole="button"
            >
              <MaterialIcons name="shopping-cart" size={ms(45)} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {}}
              accessibilityLabel="Mis favoritos"
              accessibilityRole="button"
            >
              <MaterialIcons name="star" size={ms(45)} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Barra de búsqueda placeholder */}
          <View
            style={[
              styles.searchBar,
              {
                borderColor:     colors.border,
                backgroundColor: colors.bgSection,
                borderRadius:    ms(20),
              },
            ]}
          >
            <MaterialIcons name="search" size={ms(20)} color={colors.textMuted} />
          </View>

          {/* Links de navegación */}
          <View style={[styles.links, { gap: vs(4) }]}>
            {NAV_LINKS.map((link) => (
              <TouchableOpacity
                key={link}
                style={styles.linkItem}
                onPress={() => {}}
                accessibilityLabel={link}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.linkText,
                    { color: colors.textPrimary, fontSize: ms(20) },
                  ]}
                >
                  {link}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer de branding */}
          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                { color: colors.textMuted, fontSize: ms(10) },
              ]}
            >
              © 2025 El Colibrí Artesano Costa Rica.{'\n'}
              Todos los derechos reservados.
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex:            1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    position:       'absolute',
    left:           0,
    top:            0,
    bottom:         0,
    width:          DRAWER_WIDTH,
    justifyContent: 'flex-start',
    gap:            vs(24),
  },
  iconsRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            s(24),
  },
  searchBar: {
    flexDirection:   'row',
    alignItems:      'center',
    borderWidth:     1,
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
  },
  links: {},
  linkItem: {
    paddingVertical: vs(12),
  },
  linkText: {
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
  },
  footerText: {
    lineHeight: ms(16),
  },
});
