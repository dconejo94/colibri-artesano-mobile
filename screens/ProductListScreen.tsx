import ErrorBanner from '@/src/components/ErrorBanner';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import Header from '@/components/ui/Header';
import LoadingState from '@/components/ui/LoadingState';
import ProductList from '@/src/components/ProductList';
import { useProducts } from '@/src/hooks/useProducts';
import { useTheme } from '@/src/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductListScreen() {
  const { colors, text } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { products, isLoading, error, fetchNextPage, hasNextPage, refetch } = useProducts({ limit: 10 });

  const handleObtain = (id: string) => {
    router.push(`/producto/${id}` as any);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <Header onMenuPress={() => setMenuOpen(true)} />

      <View style={{ flex: 1 }}>
        {/* Banner compacto: solo cuando ya hay productos en pantalla (ej. falló la siguiente página) */}
        {error && products.length > 0 && (
          <ErrorBanner error={error} onRetry={refetch} />
        )}

        {isLoading && products.length === 0 ? (
          <LoadingState message="Cargando productos..." />
        ) : error && products.length === 0 ? (
          // Estado a pantalla completa: ícono + mensaje + botón Reintentar centrados
          <ErrorBanner error={error} onRetry={refetch} variant="centered" />
        ) : (
          <ProductList
            products={products}
            onSelectProduct={handleObtain}
            onObtainProduct={handleObtain}
            title="Nuestros productos"
            numColumns={1}
            onEndReached={() => {
              if (hasNextPage) fetchNextPage();
            }}
          />
        )}
      </View>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}