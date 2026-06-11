import { useLocalSearchParams, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { useTheme } from '@/src/theme';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import { findProduct } from '@/data/products';

export default function ProductoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, text, spacing } = useTheme();

  const product = findProduct(id);

  // Producto no encontrado — no debería ocurrir con datos reales de la API
  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPage, alignItems: 'center', justifyContent: 'center', padding: spacing[4] }}>
        <Text style={[text.h3, { color: colors.textMuted, textAlign: 'center' }]}>
          Producto no encontrado.
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* Configura el header de navegación con el nombre del producto */}
      <Stack.Screen
        options={{
          title:           product.name,
          headerStyle:     { backgroundColor: colors.bgNavbar },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: 'DMSans_500Medium',
            color:      colors.textPrimary,
            fontSize:   15,
          },
          headerBackTitle: 'Productos',
        }}
      />

      <ProductDetailScreen
        product={{
          ...product,
          images: product.images,
        }}
        onAddToCart={(id) => console.log('Carrito:', id)}
        onBuyNow={(id)    => console.log('Comprar:', id)}
      />
    </>
  );
}
