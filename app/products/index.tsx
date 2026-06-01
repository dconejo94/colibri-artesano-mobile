import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ms } from "@/utils/scale";
import shared from "@/constants/shared-styles";
import SubHeader from "@/components/ui/SubHeader";

export default function PublicProductsScreen() {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={[shared.wrapper, isDark && shared.wrapperDark]}>
      <SubHeader title="Catálogo de Productos" onBack={() => router.back()} />
      <View style={shared.centered}>
        <MaterialIcons name="category" size={ms(64)} color={isDark ? "#4E7C74" : "#82A8AC"} />
        <Text style={[styles.title, isDark && shared.textDark]}>
          Catálogo en construcción
        </Text>
        <Text style={[styles.subtitle, isDark && shared.textMuted]}>
          Pronto podrás explorar todos los productos aquí.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: ms(20),
    fontWeight: "700",
    marginTop: ms(16),
  },
  subtitle: {
    fontSize: ms(14),
    marginTop: ms(8),
    textAlign: "center",
    paddingHorizontal: ms(32),
  },
});
