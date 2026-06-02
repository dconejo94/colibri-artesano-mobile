import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { formatPrice } from "@/utils/format";
import shared from "@/constants/shared-styles";
import { getStoreProducts, updateProductVariant } from "@/api/products";
import type { Product } from "@/types/store";
import SubHeader from "@/components/ui/SubHeader";
import Button from "@/components/ui/Button";

export default function ProductListScreen() {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();
  const { storeId } = useLocalSearchParams<{ storeId: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = useCallback(async (p = 1, append = false) => {
    if (!storeId) return;
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await getStoreProducts(storeId, p, 20);
      setProducts(append ? (prev) => [...prev, ...res.items] : res.items);
      setTotal(res.total);
      setPage(p);
    } catch { /* silent */ } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [storeId]);

  useFocusEffect(useCallback(() => { fetchProducts(1); }, [fetchProducts]));

  const totalStock = (product: Product) =>
    product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0;

  const handleStockDelta = async (product: Product, delta: number) => {
    if (!product.variants || product.variants.length === 0) return;
    if (product.variants.length > 1) {
      Alert.alert("Multiples variantes", "Por favor edita el stock en los detalles del producto.");
      return;
    }
    const variant = product.variants[0];
    const newStock = Math.max(0, variant.stock_quantity + delta);
    try {
      await updateProductVariant(product.id, variant.id, { stock_quantity: newStock });
      setProducts(products.map(p => {
        if (p.id === product.id) {
          const newVars = [...p.variants];
          newVars[0] = { ...newVars[0], stock_quantity: newStock };
          return { ...p, variants: newVars };
        }
        return p;
      }));
    } catch {
      Alert.alert("Error", "No se pudo actualizar el stock.");
    }
  };

  const handleStockChange = async (product: Product, value: string) => {
    if (!product.variants || product.variants.length === 0) return;
    if (product.variants.length > 1) return;
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    
    const variant = product.variants[0];
    try {
      await updateProductVariant(product.id, variant.id, { stock_quantity: num });
      setProducts(products.map(p => {
        if (p.id === product.id) {
          const newVars = [...p.variants];
          newVars[0] = { ...newVars[0], stock_quantity: num };
          return { ...p, variants: newVars };
        }
        return p;
      }));
    } catch {
      Alert.alert("Error", "No se pudo actualizar el stock.");
    }
  };

  const addButton = (
    <TouchableOpacity onPress={() => router.push({ pathname: "/store/products/add" as never, params: { storeId } })}>
      <MaterialIcons name="add-circle" size={ms(28)} color={isDark ? "#ACD4CD" : "#6B9E98"} />
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={[local.card, isDark ? local.cardDark : local.cardLight]}>
      <TouchableOpacity
        style={local.cardBody}
        onPress={() => router.push({ pathname: "/store/products/[id]" as never, params: { id: item.id, storeId } })}
        activeOpacity={0.7}
      >
        <View style={local.cardInfo}>
          <Text style={[local.productName, isDark && shared.textDark]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[local.productDesc, isDark && shared.textMuted]} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={[local.price, isDark && shared.textDark]}>{formatPrice(item.base_price)}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={ms(24)} color={isDark ? "#9BA1A6" : "#687076"} />
      </TouchableOpacity>
      
      {/* Stock Editor Inline */}
      <View style={local.stockControls}>
        <MaterialIcons name="inventory" size={ms(16)} color={isDark ? "#ACD4CD" : "#6B9E98"} style={{ marginRight: s(4) }} />
        {item.variants && item.variants.length === 1 ? (
          <View style={local.inlineEditor}>
            <TouchableOpacity style={local.circleBtn} onPress={() => handleStockDelta(item, -1)}>
              <MaterialIcons name="remove" size={ms(16)} color="#fff" />
            </TouchableOpacity>
            <TextInput
              style={[local.stockInput, isDark && local.stockInputDark]}
              value={String(totalStock(item))}
              keyboardType="number-pad"
              onChangeText={(text) => {
                if (text === "") return;
                handleStockChange(item, text);
              }}
            />
            <TouchableOpacity style={local.circleBtn} onPress={() => handleStockDelta(item, 1)}>
              <MaterialIcons name="add" size={ms(16)} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[local.stockText, isDark && shared.textMuted]}>
            {item.variants && item.variants.length > 1 ? `${totalStock(item)} uds (Multiples)` : "Sin variantes"}
          </Text>
        )}
      </View>

      {!item.is_active && (
        <View style={local.inactiveBadge}>
          <Text style={local.inactiveText}>Inactivo</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={[shared.wrapper, isDark && shared.wrapperDark]}>
      <SubHeader title="Mis productos" onBack={() => router.back()} rightSlot={addButton} />

      {loading ? (
        <View style={shared.centered}>
          <ActivityIndicator size="large" color={isDark ? "#82A8AC" : "#6B9E98"} />
        </View>
      ) : products.length === 0 ? (
        <View style={shared.centered}>
          <MaterialIcons name="inventory-2" size={ms(64)} color={isDark ? "#4E7C74" : "#82A8AC"} />
          <Text style={[local.emptyTitle, isDark && shared.textDark]}>Sin productos aun</Text>
          <Button title="Agregar producto" onPress={() => router.push({ pathname: "/store/products/add" as never, params: { storeId } })} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={local.list}
          onEndReached={() => {
            if (!loadingMore && products.length < total) fetchProducts(page + 1, true);
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={local.footer} color="#6B9E98" /> : null}
        />
      )}
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  list: { padding: s(16), gap: vs(10) },
  card: { borderRadius: ms(12), padding: s(14), overflow: "hidden", gap: vs(12) },
  cardLight: { backgroundColor: "#f5f5f5" },
  cardDark: { backgroundColor: "#1a1a1a" },
  cardBody: { flexDirection: "row", alignItems: "center" },
  cardInfo: { flex: 1, gap: vs(4) },
  productName: { fontSize: ms(14), fontWeight: "700", color: "#000" },
  productDesc: { fontSize: ms(11), color: "#687076" },
  price: { fontSize: ms(14), fontWeight: "700", color: "#000", marginTop: vs(4) },
  stockControls: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(150,150,150,0.2)", paddingTop: vs(10) },
  inlineEditor: { flexDirection: "row", alignItems: "center", gap: s(8) },
  circleBtn: { width: ms(24), height: ms(24), borderRadius: ms(12), backgroundColor: "#6B9E98", justifyContent: "center", alignItems: "center" },
  stockInput: { fontSize: ms(14), fontWeight: "600", color: "#000", minWidth: ms(40), textAlign: "center", padding: 0 },
  stockInputDark: { color: "#fff" },
  stockText: { fontSize: ms(11), color: "#687076" },
  inactiveBadge: { position: "absolute", top: 0, right: 0, backgroundColor: "#EF4444", paddingHorizontal: s(8), paddingVertical: vs(2), borderBottomLeftRadius: ms(8) },
  inactiveText: { fontSize: ms(10), color: "#fff", fontWeight: "600" },
  emptyTitle: { fontSize: ms(16), fontWeight: "600", color: "#000" },
  footer: { paddingVertical: vs(16) },
});
