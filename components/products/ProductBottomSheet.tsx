import { ProductDescription } from "./Detail/ProductDescription";
import { ProductDetailHeader } from "./Detail/ProductDetailHeader";
import { ProductMeta } from "./Detail/ProductMeta";
import { Colors } from "@/constants/theme";
import { Product } from "@/services/products";
import { ms, s, vs } from "@/utils/scale";
import { useEffect, useRef, useState } from "react";
import {
  Animated, Dimensions, PanResponder, StyleSheet,
  Text, TouchableOpacity, useColorScheme, View,
} from "react-native";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_MAX = SCREEN_H * 0.82;

type Props = {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (qty: number) => void;
  onBuyNow: (qty: number) => void;
};

export function ProductBottomSheet({ product, onClose, onAddToCart, onBuyNow }: Props) {
  const isDark = useColorScheme() === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const [qty, setQty] = useState(1);
  const sheetHeight = useRef(new Animated.Value(0)).current;
  const [visibleProduct, setVisibleProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (product) {
      setVisibleProduct(product);
      setQty(1);
      Animated.spring(sheetHeight, { toValue: SHEET_MAX, useNativeDriver: false }).start();
    } else {
      Animated.timing(sheetHeight, { toValue: 0, duration: 200, useNativeDriver: false })
        .start(() => setVisibleProduct(null));
    }
  }, [product]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8,
      onPanResponderRelease: (_, g) => { if (g.dy > 60) onClose(); },
    })
  ).current;

  const backdropOpacity = sheetHeight.interpolate({
    inputRange: [0, SHEET_MAX],
    outputRange: [0, 0.45],
    extrapolate: "clamp",
  });

  if (!visibleProduct) return null;

  return (
    <>
      <Animated.View
        pointerEvents={visibleProduct ? "auto" : "none"}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableOpacity style={styles.backdropTap} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[styles.sheet, { backgroundColor: C.background, height: sheetHeight }]}
      >
        <View style={styles.handleArea} {...panResponder.panHandlers}>
          <View style={[styles.handle, { backgroundColor: C.handle }]} />
        </View>

        <ProductDetailHeader
          name={visibleProduct.name}
          storeName="Artesano"
          imageUrl={visibleProduct.image_url}
          isDark={isDark}
        />

        <View style={[styles.divider, { backgroundColor: C.divider }]} />

        <Animated.ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <ProductMeta
            price={visibleProduct.price ?? null}
            rating={4.8}
            reviewCount={124}
            stock={visibleProduct.stock ?? 0}
            qty={qty}
            onQtyChange={setQty}
          />

          <View style={[styles.divider, { backgroundColor: C.divider }]} />

          <ProductDescription description={visibleProduct.description} />

          <View style={{ height: vs(20) }} />
        </Animated.ScrollView>

        <View style={[styles.footer, { backgroundColor: C.background, borderTopColor: C.divider }]}>
          <TouchableOpacity
            style={[styles.cartBtn, { borderColor: C.brandLight }]}
            onPress={() => { onAddToCart(qty); onClose(); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.cartText, { color: C.brand }]}>Agregar al carrito</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buyBtn, { backgroundColor: C.brand }]}
            onPress={() => { onBuyNow(qty); onClose(); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.buyText, { color: C.textOnBrand }]}>Comprar ahora</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: "#000", zIndex: 10 },
  backdropTap: { flex: 1 },
  sheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    zIndex: 11,
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.20,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },
  handleArea:    { paddingVertical: vs(10), alignItems: "center" },
  handle:        { width: s(40), height: vs(4), borderRadius: ms(4) },
  divider:       { height: 1, marginHorizontal: s(16), marginBottom: vs(12) },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: s(16), gap: vs(16) },
  footer: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingHorizontal: s(14),
    paddingBottom: vs(28),
    paddingTop: vs(12),
    gap: s(10),
  },
  cartBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: ms(999),
    paddingVertical: vs(12),
    alignItems: "center",
  },
  cartText: { fontWeight: "700", fontSize: ms(14) },
  buyBtn: {
    flex: 1,
    borderRadius: ms(999),
    paddingVertical: vs(12),
    alignItems: "center",
  },
  buyText: { fontWeight: "700", fontSize: ms(14) },
});