import { useLocalSearchParams, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/theme';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import { useProductDetail } from '@/src/hooks/useProductDetail';

export default function ProductoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fonts } = useTheme();

  const { product, isLoading, error, refetch } = useProductDetail(id);

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