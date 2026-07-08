import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/src/theme';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import { useProductDetail } from '@/src/hooks/useProductDetail';
import { useAddToCart } from '@/src/hooks/useAddtoCart';

export default function ProductoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, fonts } = useTheme();

  const { product, isLoading, error, refetch } = useProductDetail(id);
  const { addToCart } = useAddToCart();

  const handleAddToCart = async (productId: string, variantId?: string) => {
    const result = await addToCart({
      product_id: productId,
      variant_id: variantId ?? null,
      quantity: 1,
    });

    if (!result) {
      Alert.alert('No se pudo agregar al carrito', 'Intenta de nuevo.');
    }
  };

  const handleBuyNow = async (productId: string, variantId?: string) => {
    const result = await addToCart({
      product_id: productId,
      variant_id: variantId ?? null,
      quantity: 1,
    });

    if (!result) {
      Alert.alert('No se pudo iniciar la compra', 'Intenta de nuevo.');
      return;
    }

    router.push('/checkout');
  };

  return (
    <>
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
        />
      )}
    </>
  );
}