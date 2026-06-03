// UI primitives from React Native
// MaterialIcons for the hamburger menu icon
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type Props = {
  onMenuPress?: () => void;
};

export default function Header({ onMenuPress }: Props) {
  // reads the phone's system light/dark setting
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  return (
    // no top padding here — the SafeAreaView edges={["top"]} wrapping this component handles the status bar offset
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>

      {/* opens HamburgerMenu in HomeScreen */}
      <TouchableOpacity onPress={onMenuPress}>
        <MaterialIcons
          name="menu"
          size={28}
          color={isDark ? "#fff" : "#000"} // dark / light mode icon
        />
      </TouchableOpacity>

      {/* centered logo: bird image + app name stacked vertically */}
      <TouchableOpacity  style={styles.brand} onPress={() => router.push("/")} activeOpacity={0.7}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View>
          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
            El Colibrí
          </Text>
          <Text style={[styles.subtitle, isDark ? styles.textDark : styles.textLight]}>
            -Artesano-
          </Text>
        </View>
      </TouchableOpacity >

      {/* matches hamburger width so the brand stays visually centered */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  containerLight: {
    backgroundColor: "#fff",
  },
  containerDark: {
    backgroundColor: "#000",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    height: 40,
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
  },
  textLight: {
    color: "#000",
  },
  textDark: {
    color: "#fff",
  },
  spacer: {
    width: 28, // matches hamburger width so the brand stays visually centered
  },
});
