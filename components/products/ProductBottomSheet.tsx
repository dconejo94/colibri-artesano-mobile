import { ProductDescription } from "./Detail/ProductDescription";
import { ProductMeta } from "./Detail/ProductMeta";
import { getProductImage } from "@/utils/productImages";
import { Product } from "@/services/products";
import { ms, s, vs } from "@/utils/scale";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_MAX = SCREEN_H * 0.82;
const SHEET_MIN = 0;

type Props = {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (qty: number) => void;
  onBuyNow: (qty: number) => void;
};

export function ProductBottomSheet({ product, onClose, onAddToCart, onBuyNow }: Props) {
  const isDark = useColorScheme() === "dark";
  const [qty, setQty] = useState(1);

  const sheetHeight = useRef(new Animated.Value(SHEET_MIN)).current;

  useEffect(() => {
    Animated.spring(sheetHeight, {
      toValue: product ? SHEET_MAX : SHEET_MIN,
      useNativeDriver: false,
      bounciness: 5,
    }).start();

    if (product) setQty(1);
  }, [product]);

  // Drag para cerrar
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8,
      onPanResponderRelease: (_, g) => {
        if (g.dy > 60) onClose();
      },
    })
  ).current;

  // Backdrop opacity ligada al height
  const backdropOpacity = sheetHeight.interpolate({
    inputRange: [0, SHEET_MAX],
    outputRange: [0, 0.45],
    extrapolate: "clamp",
  });

  if (!product && backdropOpacity === null) return null;

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        pointerEvents={product ? "auto" : "none"}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableOpacity style={styles.backdropTap} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: isDark ? "#111" : "#fff", height: sheetHeight },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleArea} {...panResponder.panHandlers}>
          <View style={[styles.handle, { backgroundColor: isDark ? "#444" : "#D0D0D0" }]} />
        </View>

        {/* Imagen + nombre */}
        {product && (
          <View style={styles.productHeader}>
            <Image
              source={getProductImage(product.image_url)}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productTitleBlock}>
              <Text style={[styles.productName, { color: isDark ? "#fff" : "#1A1A1A" }]}
                numberOfLines={2}
              >
                {product.name}
              </Text>
              <Text style={styles.productArtisan}>por Artesano</Text>
            </View>
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: isDark ? "#222" : "#EFEFEF" }]} />

        {/* Contenido scrollable */}
        <Animated.ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {product && (
            <>
              <ProductMeta
                price={product.price ?? null}
                rating={4.8}
                reviewCount={124}
                stock={product.stock ?? 7}
                qty={qty}
                onQtyChange={setQty}
              />

              <View style={[styles.divider, { backgroundColor: isDark ? "#222" : "#EFEFEF" }]} />

              <ProductDescription text={product.description} />

              <View style={{ height: vs(20) }} />
            </>
          )}
        </Animated.ScrollView>

        {/* Footer con botones */}
        <View
          style={[
            styles.footer,
            { backgroundColor: isDark ? "#111" : "#fff" },
            isDark ? styles.footerBorderDark : styles.footerBorderLight,
          ]}
        >
          <TouchableOpacity
            style={[styles.cartBtn, { borderColor: "#82A8AC" }]}
            onPress={() => { onAddToCart(qty); onClose(); }}
            activeOpacity={0.8}
          >
            <Text style={styles.cartText}>Agregar al carrito</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => { onBuyNow(qty); onClose(); }}
            activeOpacity={0.8}
          >
            <Text style={styles.buyText}>Comprar ahora</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 10,
  },
  backdropTap: { flex: 1 },

  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },

  handleArea: { paddingVertical: vs(10), alignItems: "center" },
  handle: { width: s(40), height: vs(4), borderRadius: ms(4) },

  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: s(16),
    paddingBottom: vs(12),
    gap: s(12),
  },
  productImage: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(10),
  },
  productTitleBlock: { flex: 1, gap: vs(3) },
  productName: { fontSize: ms(16), fontWeight: "700", lineHeight: ms(22) },
  productArtisan: { fontSize: ms(12), color: "#82A8AC", fontStyle: "italic" },

  divider: { height: 1, marginHorizontal: s(16), marginBottom: vs(12) },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: s(16), gap: vs(16) },

  footer: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingHorizontal: s(14),
    paddingBottom: vs(28),
    paddingTop: vs(12),
    gap: s(10),
  },
  footerBorderLight: { borderTopColor: "#E5E5E5" },
  footerBorderDark: { borderTopColor: "#222" },

  cartBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: ms(24),
    paddingVertical: vs(12),
    alignItems: "center",
  },
  cartText: { color: "#3E5F63", fontWeight: "700", fontSize: ms(14) },

  buyBtn: {
    flex: 1,
    backgroundColor: "#3E5F63",
    borderRadius: ms(24),
    paddingVertical: vs(12),
    alignItems: "center",
  },
  buyText: { color: "#fff", fontWeight: "700", fontSize: ms(14) },
});