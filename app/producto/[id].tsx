import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/src/theme';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import { useProductDetail } from '@/src/hooks/useProductDetail';
import { addToCart } from '@/api/cart';
import { useCartStore } from '@/src/store/cartStore';
import { normalizeError } from '@/src/api/errors';

export default function ProductoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const { product, isLoading, error, refetch } = useProductDetail(id);

  const handleAddToCart = async (productId: string, variantId: string | null) => {
    try {
      const cart = await addToCart({ product_id: productId, variant_id: variantId, quantity: 1 });
      useCartStore.getState().setFromCart(cart);
      Toast.show({ type: 'success', text1: 'Añadido al carrito' });
      return true;
    } catch (err) {
      Toast.show({ type: 'error', text1: 'No se pudo añadir al carrito', text2: normalizeError(err).message });
      return false;
    }
  };

  const handleBuyNow = async (productId: string, variantId: string | null) => {
    const added = await handleAddToCart(productId, variantId);
    if (added) router.push('/carrito' as any);
  };

  return (
    <>
      {/* Navigation header: uses the product name once loaded,
          and a neutral title while loading or on failure. */}
      <Stack.Screen
        options={{
          title: product?.name ?? 'Producto',
          headerStyle: { backgroundColor: colors.bgNavbar },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: fonts.sanMedium,
            color: colors.textPrimary,
            fontSize: 15,
          },
          headerBackTitle: 'Productos',
        }}
      />

      {/* ProductDetailScreen handles loading/error/content internally
          (including the ErrorBanner `centered` variant). Don't duplicate
          that handling here. */}
      {isLoading ? (
        <View style={{ flex: 1, backgroundColor: colors.bgPage, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ProductDetailScreen
          product={product ?? null}
          error={error}
          onRetry={refetch}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onArtisanPress={(storeId) => router.push(`/tienda/${storeId}` as any)}
        />
      )}
    </>
  );
}