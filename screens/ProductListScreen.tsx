import { ProductCard } from "@/components/products/ProductCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import HamburgerMenu from "@/components/ui/HamburgerMenu";
import Header from "@/components/ui/Header";
import { Colors } from "@/constants/theme";
import { getProducts, Product } from "@/services/products";
import { ms, s, vs } from "@/utils/scale";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLUMNS = 2;
const H_PADDING = s(16);
const GAP = s(12);
const CARD_WIDTH =
  (Dimensions.get("window").width - H_PADDING * 2 - GAP) / COLUMNS;

export default function ProductListScreen() {
  const isDark = useColorScheme() === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts();
      setProducts(res.items);
    } catch {
      setError("No se pudieron cargar los productos.\nIntentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <Header onMenuPress={() => setMenuOpen(true)} />
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {loading ? (
        <ThemedView style={styles.center}>
          <ActivityIndicator size="large" color={isDark ? "#82A8AC" : "#3E5F63"} />
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.center}>
          <ThemedText type="default" style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryBtn} onPress={loadProducts}>
            <ThemedText type="defaultSemiBold" style={styles.retryText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={COLUMNS}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ProductCard item={item} width={CARD_WIDTH} />}
          ListHeaderComponent={
            <ThemedText type="subtitle" style={styles.heading}>Productos</ThemedText>
          }
          ListEmptyComponent={
            <ThemedView style={styles.center}>
              <ThemedText type="default">No hay productos disponibles.</ThemedText>
            </ThemedView>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  heading: { marginBottom: vs(16) },
  grid: { padding: H_PADDING, paddingBottom: vs(32) },
  row:  { justifyContent: "space-between", marginBottom: GAP },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: vs(12),
    padding: s(24),
    backgroundColor: "transparent",
  },
  errorText: { textAlign: "center", opacity: 0.8 },
  retryBtn: {
    backgroundColor: "#82A8AC",
    paddingHorizontal: s(24),
    paddingVertical: vs(10),
    borderRadius: ms(20),
  },
  retryText: { color: "#fff", fontSize: ms(14) },
});
