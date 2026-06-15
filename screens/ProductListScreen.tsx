import ErrorState from '@/components/ui/ErrorState';
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
  const { products, isLoading, isError, fetchNextPage, hasNextPage } = useProducts({ limit: 10 });

  const handleObtain = (id: string) => {
    router.push(`/producto/${id}` as any);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <Header onMenuPress={() => setMenuOpen(true)} />
      
      <View style={{ flex: 1 }}>
        {isLoading && products.length === 0 ? (
          <LoadingState message="Cargando productos..."/>
        ) : isError ? (
          <ErrorState message="Error al cargar los productos."/>
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
