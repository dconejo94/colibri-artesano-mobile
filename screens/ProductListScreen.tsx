import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import ProductList from '@/src/components/ProductList';
import Header from '@/components/ui/Header';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import { useProducts } from '@/src/hooks/useProducts';

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
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[text.body, { color: colors.errorText }]}>Error al cargar los productos.</Text>
          </View>
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
