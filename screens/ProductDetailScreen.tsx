import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Button from "@/components/ui/Button";
import { Colors } from "@/constants/theme";
import { getProductById, Product } from "@/services/products";
import { getProductImage } from "@/utils/productImages";
import { ms, s, vs } from "@/utils/scale";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    getProductById(Number(id))
      .then(setProduct)
      .catch(() => setError("No se pudo cargar el producto."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <NavBar isDark={isDark} onBack={() => router.back()} />
        <ThemedView style={styles.center}>
          <ActivityIndicator size="large" color={isDark ? "#82A8AC" : "#3E5F63"} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <NavBar isDark={isDark} onBack={() => router.back()} />
        <ThemedView style={styles.center}>
          <ThemedText style={styles.errorText}>
            {error ?? "Producto no encontrado."}
          </ThemedText>

          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <ThemedText style={styles.retryText}>Volver</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <NavBar isDark={isDark} onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={[styles.headerBg, { backgroundColor: colors.headerBg }]}>
          <ThemedText type="title" style={styles.name}>
            {product.name}
          </ThemedText>

          <Image
            source={getProductImage(product.image_url)}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.contentBg }]}>
          {product.price != null && (
            <ThemedText type="defaultSemiBold" style={styles.price}>
              ₡{product.price.toLocaleString("es-CR")}
            </ThemedText>
          )}

          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Descripción:
            </ThemedText>

            <ThemedText style={styles.body}>
              {product.description}
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* BOTÓN */}
      <ThemedView
        style={[
          styles.bottomBar,
          isDark ? styles.bottomBarDark : styles.bottomBarLight,
        ]}
      >
        <Button title="Agregar al carrito" onPress={() => {}} />
      </ThemedView>
    </SafeAreaView>
  );
}


function NavBar({ isDark, onBack }: { isDark: boolean; onBack: () => void }) {
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.navBar,
        {
          backgroundColor: colors.background,
          borderBottomColor: isDark ? "#222" : "#E5E5E5",
        },
      ]}
    >
      <TouchableOpacity onPress={onBack} hitSlop={8}>
        <MaterialIcons name="chevron-left" size={ms(28)} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.breadcrumb}>
        <ThemedText style={styles.breadcrumbItem}>Productos</ThemedText>
        <ThemedText style={styles.breadcrumbSep}> | </ThemedText>
        <ThemedText style={styles.breadcrumbActive}>
          Detalles de producto
        </ThemedText>
      </View>

      <MaterialIcons name="more-horiz" size={ms(24)} color={colors.icon} />
    </View>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1 },

  navBar: {
    height: vs(52),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: s(12),
    borderBottomWidth: 1,
    gap: s(8),
  },

  breadcrumb: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  breadcrumbItem: { fontSize: ms(13), opacity: 0.6 },
  breadcrumbSep: { fontSize: ms(13), opacity: 0.4 },
  breadcrumbActive: { fontSize: ms(13) },

  headerBg: {
    width: "100%",
    paddingTop: vs(20),
    paddingBottom: vs(30),
    alignItems: "center",
  },

  name: {
    color: "#fff",
    fontSize: ms(28),
    fontWeight: "bold",
    marginBottom: vs(12),
    textAlign: "center",
  },

  mainImage: {
    width: "90%",
    height: vs(240),
    borderRadius: ms(16),
  },

  infoCard: {
    marginTop: vs(50),
    width: "100%",

    minHeight: "auto",

    padding: s(18),

    gap: vs(12),

    // sombra (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },

    // Android
    elevation: 6,
  },

  price: {
    fontSize: ms(18),
    color: "#3E5F63",
  },

  section: {
    gap: vs(4),
  },

  sectionTitle: {
    fontSize: ms(16),
  },

  body: {
    opacity: 0.85,
    lineHeight: ms(22),
  },

  /* BUTTON */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: s(16),
    paddingBottom: vs(28),
    alignItems: "center",
    borderTopWidth: 1,
  },

  bottomBarLight: {
    borderTopColor: "#E5E5E5",
  },

  bottomBarDark: {
    borderTopColor: "#222",
  },

  /* STATES */
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: vs(12),
    padding: s(24),
  },

  errorText: {
    textAlign: "center",
    opacity: 0.8,
  },

  retryBtn: {
    backgroundColor: "#82A8AC",
    paddingHorizontal: s(24),
    paddingVertical: vs(10),
    borderRadius: ms(20),
  },

  retryText: {
    color: "#fff",
    fontSize: ms(14),
  },
});