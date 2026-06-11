import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import StatusBadge, { type BadgeStatus } from '@/src/components/StatusBadge';

// ─── Tipos ───────────────────────────────────────────────────────────────────
export interface BottomSheetProduct {
  id:          string;
  name:        string;
  artisan:     string;
  price:       number;
  currency:    string;
  imageUri:    string;
  status:      BadgeStatus;
  category:    string;
  description: string;
}

interface Props {
  product:     BottomSheetProduct | null;
  visible:     boolean;
  onClose:     () => void;
  onBuyNow:    (id: string) => void;
  onAddToCart: (id: string) => void;
  onViewDetail:(id: string) => void;
}

const SHEET_HEIGHT = 480;
const ANIMATION_DURATION = 320;

// ─── Componente ───────────────────────────────────────────────────────────────
export default function ProductBottomSheet({
  product,
  visible,
  onClose,
  onBuyNow,
  onAddToCart,
  onViewDetail,
}: Props) {
  const { colors, spacing, radii, shadows, text } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue:         0,
        duration:        ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue:         SHEET_HEIGHT,
        duration:        ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!product) return null;

  const isSoldOut = product.status === 'sold_out';

  const priceFormatted = new Intl.NumberFormat(
    product.currency === 'CRC' ? 'es-CR' : 'en-US',
    { style: 'currency', currency: product.currency, maximumFractionDigits: 0 },
  ).format(product.price);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop semitransparente */}
      <Pressable
        style={[styles.backdrop, { backgroundColor: 'rgba(44,56,48,0.5)' }]}
        onPress={onClose}
        accessibilityLabel="Cerrar"
      />

      {/* Panel deslizable desde abajo */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height:          SHEET_HEIGHT,
            backgroundColor: colors.bgCard,
            borderTopLeftRadius:  radii.xl,
            borderTopRightRadius: radii.xl,
            paddingBottom:   Math.max(insets.bottom, spacing[4]),
            transform:       [{ translateY }],
            ...shadows.lg,
          },
        ]}
      >
        {/* Pastilla handle */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }}
        >
          {/* Imagen + info básica */}
          <View style={styles.productRow}>
            <Image
              source={{ uri: product.imageUri }}
              style={[styles.productImage, { borderRadius: radii.md }]}
              resizeMode="cover"
              accessibilityLabel={`Foto de ${product.name}`}
            />
            <View style={styles.productInfo}>
              <Text
                style={[text.caption, { color: colors.textMuted, letterSpacing: 0.8 }]}
                numberOfLines={1}
              >
                {product.category.toUpperCase()}
              </Text>
              <Text
                style={[text.productName, { color: colors.textPrimary, marginTop: 2 }]}
                numberOfLines={2}
              >
                {product.name}
              </Text>
              <Text
                style={[text.label, { color: colors.primaryDeep, marginTop: 2 }]}
                numberOfLines={1}
              >
                {product.artisan}
              </Text>
              <View style={{ marginTop: spacing[2] }}>
                <StatusBadge status={product.status} />
              </View>
            </View>
          </View>

          {/* Precio */}
          <Text style={[text.priceDetail, { color: colors.primary }]}>
            {priceFormatted}
          </Text>

          {/* Descripción corta */}
          <Text
            style={[text.body, { color: colors.textSecondary }]}
            numberOfLines={3}
          >
            {product.description}
          </Text>

          {/* Ver detalle completo */}
          <Pressable
            onPress={() => onViewDetail(product.id)}
            accessibilityLabel="Ver detalle completo del producto"
            accessibilityRole="button"
          >
            <Text
              style={[
                text.button,
                {
                  color:         colors.btnGhostText,
                  textDecorationLine: 'underline',
                  textAlign:     'center',
                },
              ]}
            >
              Ver detalle completo →
            </Text>
          </Pressable>

          {/* Botones de acción */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  flex:            1,
                  backgroundColor: colors.btnSecondaryBg,
                  borderRadius:    radii.md,
                  borderWidth:     1,
                  borderColor:     colors.btnSecondaryBorder,
                  opacity:         isSoldOut || pressed ? 0.6 : 1,
                },
              ]}
              onPress={() => onAddToCart(product.id)}
              disabled={isSoldOut}
              accessibilityLabel="Agregar al carrito"
              accessibilityRole="button"
            >
              <Text style={[text.button, { color: colors.btnSecondaryText }]}>
                Al carrito
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  flex:            1.6,
                  backgroundColor: colors.btnPrimaryBg,
                  borderRadius:    radii.md,
                  opacity:         isSoldOut || pressed ? 0.6 : 1,
                },
              ]}
              onPress={() => onBuyNow(product.id)}
              disabled={isSoldOut}
              accessibilityLabel={isSoldOut ? 'Producto agotado' : 'Comprar ahora'}
              accessibilityRole="button"
            >
              <Text style={[text.button, { color: colors.btnPrimaryText }]}>
                {isSoldOut ? 'Agotado' : 'Comprar ahora'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    left:     0,
    right:    0,
    bottom:   0,
  },
  handle: {
    width:        40,
    height:       4,
    borderRadius: 2,
    alignSelf:    'center',
    marginTop:    12,
    marginBottom: 4,
  },
  productRow: {
    flexDirection: 'row',
    gap:           12,
    alignItems:    'flex-start',
  },
  productImage: {
    width:      96,
    height:     96,
    flexShrink: 0,
  },
  productInfo: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap:           10,
  },
  actionBtn: {
    height:          48,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 12,
  },
});
