import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { s, vs, ms } from "@/utils/scale";

const DRAWER_WIDTH = s(264);

type MenuEntry = {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  route?: string;
};

const MENU_ITEMS: MenuEntry[] = [
  { icon: "person", label: "Mi Cuenta" },
  { icon: "shopping-cart", label: "Carrito" },
  { icon: "favorite", label: "Favoritos" },
  { icon: "storefront", label: "Mi Tienda", route: "/store" },
  { icon: "category", label: "Productos", route: "/products" },
  { icon: "handshake", label: "Marcas Aliadas" },
  { icon: "mail", label: "Contacto" },
  { icon: "article", label: "Blog y novedades" },
  { icon: "event", label: "Eventos" },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HamburgerMenu({ isOpen, onClose }: Props) {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();

  // internal visibility controls modal — separate from isOpen so we can
  // animate out before hiding the modal
  const [visible, setVisible] = useState(false);
  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      translateX.value = withTiming(0, { duration: 300 });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 300 });
      // hide modal after animation completes
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = (entry: MenuEntry) => {
    onClose();
    if (entry.route) {
      router.push(entry.route as never);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>

        {/* semi-transparent backdrop — closes menu on tap */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* drawer panel slides in from left */}
        <Animated.View style={[
          styles.drawer,
          isDark ? styles.drawerDark : styles.drawerLight,
          animatedStyle,
        ]}>

          {/* navigation links */}
          <View style={styles.links}>
            {MENU_ITEMS.map((entry) => (
              <TouchableOpacity
                key={entry.label}
                style={styles.linkItem}
                onPress={() => handlePress(entry)}
              >
                <MaterialIcons name={entry.icon} size={ms(22)} color="#6B9E98" />
                <Text style={[styles.linkText, isDark ? styles.textDark : styles.textLight]}>
                  {entry.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* footer branding */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, isDark ? styles.textDark : styles.textLight]}>
              © 2025 El Colibri Artesano Costa Rica.{"\n"}Todos los derechos reservados.
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    paddingTop: vs(60),
    paddingHorizontal: s(20),
    paddingBottom: vs(24),
    justifyContent: "flex-start",
    gap: vs(24),
  },
  drawerLight: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  drawerDark: {
    backgroundColor: "rgba(0,0,0,0.88)",
  },
  links: {
    gap: vs(4),
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(10),
    paddingVertical: vs(12),
  },
  linkText: {
    fontSize: ms(20),
    fontWeight: "500",
  },
  textLight: {
    color: "#000",
  },
  textDark: {
    color: "#fff",
  },
  footer: {
    marginTop: "auto",
  },
  footerText: {
    fontSize: ms(10),
    lineHeight: ms(16),
  },
});
