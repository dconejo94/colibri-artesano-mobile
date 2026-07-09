import ErrorBanner from '@/src/components/ErrorBanner';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import Header from '@/components/ui/Header';
import LoadingState from '@/components/ui/LoadingState';
import ProductList from '@/src/components/ProductList';
import { useTheme } from '@/src/theme';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFavoriteProducts } from '@/api/users';
import type { Product } from '@/types/store';
import { normalizeError, type ApiError } from '@/src/api/errors';
import { useFocusEffect, Stack } from 'expo-router';
import { resolveProductImage } from '@/utils/resolveProductImage';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchProducts = useCallback(async (p = 1, append = false) => {
    if (p === 1) setIsLoading(true);
    setError(null);
    try {
      const res = await getFavoriteProducts(p, 10);
      const items = res.items.map((p: any) => {
        const primaryImage = resolveProductImage(p);
        const isAvailable = p.is_active && (!(p.variants?.length ?? 0) || (p.variants ?? []).some((v: any) => v.stock_quantity > 0));

        return {
          id: p.id,
          name: p.name,
          artisan: p.store?.name || 'Colibrí Artesano',
          storeId: p.store?.id,
          price: Number(p.base_price) || 0,
          currency: 'CRC',
          imageUri: primaryImage,
          status: isAvailable ? 'available' : 'sold_out',
          category: p.category?.name || 'Artesanía',
          shortDescription: p.description?.substring(0, 50),
          isFavorite: true
        };
      });
      setProducts(append
        ? (prev) => {
            const seen = new Set(prev.map((p) => p.id));
            return [...prev, ...items.filter((p: { id: string }) => !seen.has(p.id))];
          }
        : items);
      setTotal(res.total);
      setPage(p);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchProducts(1); }, [fetchProducts]));

  const fetchNextPage = () => {
    if (products.length < total) {
      fetchProducts(page + 1, true);
    }
  };

  const handleObtain = (id: string) => {
    router.push(`/producto/${id}` as any);
  };

  const handleFavoriteToggle = (id: string, isFavorite: boolean) => {
    // This screen only ever lists favorites, so an unfavorite here means the
    // row no longer belongs — drop it instead of leaving a stale heart icon
    // until the next fetch.
    if (isFavorite) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header onMenuPress={() => setMenuOpen(true)} />

      <View style={{ flex: 1 }}>
        {error && products.length > 0 && (
          <ErrorBanner error={error} onRetry={() => fetchProducts(1)} />
        )}

        {isLoading && products.length === 0 ? (
          <LoadingState message="Cargando tus favoritos..." />
        ) : error && products.length === 0 ? (
          <ErrorBanner error={error} onRetry={() => fetchProducts(1)} variant="centered" />
        ) : (
          <ProductList
            products={products as any}
            onSelectProduct={handleObtain}
            onObtainProduct={handleObtain}
            onArtisanPress={(storeId) => router.push(`/tienda/${storeId}` as any)}
            onFavoriteToggle={handleFavoriteToggle}
            title="Mis Favoritos"
            numColumns={1}
            onEndReached={fetchNextPage}
          />
        )}
      </View>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
