import { ms, s, vs } from "@/utils/scale";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const DRAWER_WIDTH = s(264);

// placeholder links — onPress wired when screens are built
const NAV_LINKS: { label: string; route: string | null }[] = [
  { label: "Productos",       route: "/products" },
  { label: "Marcas Aliadas",  route: null },
  { label: "Contacto",        route: null },
  { label: "Blog y novedades",route: null },
  { label: "Eventos",         route: null },
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
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleNavPress = (route: string | null) => {
    if (!route) return;
    onClose();
    setTimeout(() => router.push(route as any), 320);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>

        {/* semi-transparent backdrop — closes menu on tap */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View style={[
          styles.drawer,
          isDark ? styles.drawerDark : styles.drawerLight,
          animatedStyle,
        ]}>

          {/* drawer panel slides in from left */}
          <View style={styles.iconsRow}>
            <TouchableOpacity onPress={() => {}}>
              <MaterialIcons name="person" size={ms(45)} color="#6B9E98" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <MaterialIcons name="shopping-cart" size={ms(45)} color="#6B9E98" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <MaterialIcons name="star" size={ms(45)} color="#6B9E98" />
            </TouchableOpacity>
          </View>

          {/* search bar placeholder — SearchBar component (#18) wired here later */}
          <View style={[styles.searchBar, isDark ? styles.searchBarDark : styles.searchBarLight]}>
            <MaterialIcons name="search" size={ms(20)} color={isDark ? "#fff" : "#888"} />
          </View>

          {/* navigation links */}
          <View style={styles.links}>
            {NAV_LINKS.map(({ label, route }) => (
              <TouchableOpacity
                key={label}
                style={styles.linkItem}
                onPress={() => handleNavPress(route)}
                activeOpacity={route ? 0.6 : 1}
              >
                <Text style={[
                  styles.linkText,
                  isDark ? styles.textDark : styles.textLight,
                  !route && styles.linkDisabled,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* footer branding */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, isDark ? styles.textDark : styles.textLight]}>
              © 2025 El Colibrí Artesano Costa Rica.{"\n"}Todos los derechos reservados.
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
  iconsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: s(24),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: ms(20),
    borderWidth: 1,
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
  },
  searchBarLight: {
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
  },
  searchBarDark: {
    borderColor: "#444",
    backgroundColor: "#111",
  },
  links: {
    gap: vs(4),
  },
  linkItem: {
    paddingVertical: vs(12),
  },
  linkText: {
    fontSize: ms(20),
    fontWeight: "500",
  },
  linkDisabled: {
    opacity: 0.35,
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
