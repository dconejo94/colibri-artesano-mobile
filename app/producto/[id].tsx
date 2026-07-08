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
  const { product, isLoading, isError } = useProductDetail(id);
  const { addToCart } = useAddToCart();


  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPage,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }


  if (isError || !product) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPage,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing[4],
        }}
      >
        <Text
          style={[
            text.h3,
            {
              color: colors.textMuted,
              textAlign: 'center',
            },
          ]}
        >
          Producto no encontrado.
        </Text>
      </View>
    );
  }


  const handleAddToCart = async (
    productId: string,
    variantId?: string
  ) => {
    const result = await addToCart({
      product_id: productId,
      variant_id: variantId ?? null,
      quantity: 1,
    });

    if (!result) {
      Alert.alert(
        'No se pudo agregar al carrito',
        'Intenta de nuevo.'
      );
    }
  };


  const handleBuyNow = async (
    productId: string,
    variantId?: string
  ) => {
    const result = await addToCart({
      product_id: productId,
      variant_id: variantId ?? null,
      quantity: 1,
    });

    if (!result) {
      Alert.alert(
        'No se pudo iniciar la compra',
        'Intenta de nuevo.'
      );
      return;
    }

    router.push('/checkout');
  };


  return (
    <>
      {/* Header de navegación: usa el nombre del producto si ya cargó,
          y un título neutro mientras carga o si falló. */}
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

      {/* ProductDetailScreen maneja loading/error/contenido internamente
          (incluida la variante `centered` del ErrorBanner). No dupliques
          ese manejo acá. */}
      {isLoading ? (
        <View style={{ flex: 1, backgroundColor: colors.bgPage, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ProductDetailScreen
          product={product ?? null}
          error={error ?? (!product ? { status: 404, message: 'Producto no encontrado.' } : null)}
          onRetry={refetch}
          onAddToCart={(id) => console.log('Carrito:', id)}
          onBuyNow={(id) => console.log('Comprar:', id)}
        />
      )}
    </>
  );
}