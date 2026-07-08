import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import Header from '@/components/ui/Header';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import LoadingState from '@/components/ui/LoadingState';
import ErrorBanner from '@/src/components/ErrorBanner';
import SearchBar from '@/src/components/SearchBar';
import ProductCard from '@/src/components/ProductCard';

import { useSearch } from '@/src/hooks/useSearch';
import { SearchScope } from '@/api/search';
import { useTheme, fonts } from '@/src/theme';
import { s, vs, ms } from '@/utils/scale';
import { resolveProductImage } from '@/utils/resolveProductImage';

// Inline StoreCard for search results
const StoreCard = ({ store, onPress }: { store: any, onPress: () => void }) => {
  const { colors, radii, shadows, text } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.storeCard, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.sm }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.storeIcon, { backgroundColor: colors.bgSection, borderRadius: radii.md }]}>
        <MaterialIcons name="storefront" size={ms(28)} color={colors.primary} />
      </View>
      <View style={styles.storeInfo}>
        <Text style={[text.h3, { color: colors.textPrimary }]} numberOfLines={1}>
          {store.name}
        </Text>
        <Text style={[text.body, { color: colors.textSecondary, marginTop: vs(2) }]} numberOfLines={2}>
          {store.description || 'Sin descripción'}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={ms(24)} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

// Inline CategoryChip
const CategoryChip = ({ category, onPress }: { category: any, onPress: () => void }) => {
  const { colors, radii, text } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.categoryChip, { backgroundColor: colors.bgSection, borderRadius: radii.full, borderColor: colors.primarySoft, borderWidth: 1 }]}
      onPress={onPress}
    >
      <MaterialIcons name="category" size={ms(18)} color={colors.primaryDeep} />
      <Text style={[text.body, { color: colors.primaryDeep, marginLeft: s(8), fontFamily: fonts.sanMedium }]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

export default function SearchResultsScreen() {
  const { colors, text, spacing } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialQ = (params.q as string) || '';
  const initialScope = (params.scope as SearchScope) || 'all';

  const [menuOpen, setMenuOpen] = useState(false);

  const {
    query,
    setQuery,
    scope,
    setScope,
    results,
    isLoading,
    error,
    performSearch,
  } = useSearch(initialScope);

  useEffect(() => {
    if (initialQ) {
      setQuery(initialQ);
      performSearch(initialQ, initialScope, 1);
    }
  }, [initialQ, initialScope, performSearch, setQuery]);

  // For infinite scroll
  const fetchNextPage = () => {
    if (scope === 'all' || scope === 'categories') return;
    const paginated = results as any;
    if (paginated && paginated.items && paginated.items.length < paginated.total) {
      performSearch(query, scope, paginated.page + 1);
    }
  };

  const mapProduct = (p: any) => ({
    id: p.id,
    name: p.name,
    artisan: p.store?.name || 'Tienda',
    storeId: p.store?.id,
    price: Number(p.base_price) || 0,
    currency: 'CRC',
    imageUri: resolveProductImage(p),
    status: (p.is_active && (!(p.variants?.length ?? 0) || (p.variants ?? []).some((v: any) => v.stock_quantity > 0))) ? 'available' : 'sold_out',
    category: p.category?.name,
    shortDescription: p.description?.substring(0, 50),
    isFavorite: false,
  });

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="search-off" size={ms(80)} color={colors.primarySoft} />
      <Text style={[text.h3, { color: colors.primaryDeep, marginTop: vs(16), textAlign: 'center' }]}>
        No se encontraron resultados
      </Text>
      <Text style={[text.body, { color: colors.textSecondary, marginTop: vs(8), textAlign: 'center' }]}>
        Intenta buscar con otras palabras o cambiar la categoría de búsqueda.
      </Text>
    </View>
  );

  const renderAllScope = () => {
    const allRes = results as any;
    if (!allRes) return null;

    const hasProducts = allRes.products && allRes.products.length > 0;
    const hasStores = allRes.stores && allRes.stores.length > 0;
    const hasCategories = allRes.categories && allRes.categories.length > 0;

    if (!hasProducts && !hasStores && !hasCategories) {
      return renderEmptyState();
    }

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: vs(24) }}>
        {hasCategories && (
          <View style={styles.section}>
            <Text style={[text.h3, { color: colors.primaryDeep, marginBottom: vs(12) }]}>Categorías</Text>
            <View style={styles.chipRow}>
              {allRes.categories.map((c: any) => (
                <CategoryChip key={c.id} category={c} onPress={() => { setScope('products'); setQuery(c.name); performSearch(c.name, 'products', 1); }} />
              ))}
            </View>
          </View>
        )}

        {hasStores && (
          <View style={styles.section}>
            <Text style={[text.h3, { color: colors.primaryDeep, marginBottom: vs(12) }]}>Emprendedores</Text>
            {allRes.stores.map((s: any) => (
              <View key={s.id} style={{ marginBottom: vs(8) }}>
                <StoreCard store={s} onPress={() => router.push(`/tienda/${s.id}` as any)} />
              </View>
            ))}
          </View>
        )}

        {hasProducts && (
          <View style={styles.section}>
            <Text style={[text.h3, { color: colors.primaryDeep, marginBottom: vs(12) }]}>Productos</Text>
            <View style={styles.productGrid}>
              {allRes.products.map((p: any) => (
                <View key={p.id} style={{ width: '48%', marginBottom: vs(16) }}>
                  <ProductCard
                    {...(mapProduct(p) as any)}
                    onPress={() => router.push(`/producto/${p.id}` as any)}
                    onArtisanPress={() => router.push(`/tienda/${p.store?.id}` as any)}
                    onObtain={() => router.push(`/producto/${p.id}` as any)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderFlatList = (data: any[], renderItem: any, numColumns = 1) => {
    if (data.length === 0) return renderEmptyState();
    return (
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={numColumns}
        contentContainerStyle={[styles.listContent, numColumns > 1 && { paddingHorizontal: spacing[4] }]}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.3}
      />
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <Header onMenuPress={() => setMenuOpen(true)} />

      <View style={{ paddingHorizontal: s(16), paddingTop: vs(16), paddingBottom: vs(8), zIndex: 50 }}>
        <SearchBar scope={scope} locked={false} />
      </View>

      <View style={{ flex: 1, zIndex: 1 }}>
        {error && (
          <ErrorBanner error={error} onRetry={() => performSearch(query, scope, 1)} />
        )}

        {isLoading && !results ? (
          <LoadingState message="Buscando..." />
        ) : !results ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search" size={ms(80)} color={colors.primarySoft} />
            <Text style={[text.h3, { color: colors.primaryDeep, marginTop: vs(16), textAlign: 'center' }]}>
              Descubre Colibrí Artesano
            </Text>
          </View>
        ) : scope === 'all' ? (
          renderAllScope()
        ) : scope === 'products' ? (
          renderFlatList(
            (results as any).items || [],
            ({ item }) => (
              <View style={{ width: '48%', marginBottom: vs(16) }}>
                <ProductCard
                  {...(mapProduct(item) as any)}
                  onPress={() => router.push(`/producto/${item.id}` as any)}
                  onArtisanPress={() => router.push(`/tienda/${item.store?.id}` as any)}
                  onObtain={() => router.push(`/producto/${item.id}` as any)}
                />
              </View>
            ),
            2
          )
        ) : scope === 'stores' ? (
          renderFlatList(
            (results as any).items || [],
            ({ item }) => (
              <View style={{ marginBottom: vs(12) }}>
                 <StoreCard store={item} onPress={() => router.push(`/tienda/${item.id}` as any)} />
              </View>
            )
          )
        ) : (
           renderFlatList(
            results as any, // categories is not paginated
            ({ item }) => (
              <View style={{ marginBottom: vs(8) }}>
                 <CategoryChip category={item} onPress={() => { setScope('products'); setQuery(item.name); performSearch(item.name, 'products', 1); }} />
              </View>
            )
          )
        )}
      </View>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(32),
  },
  section: {
    paddingHorizontal: s(16),
    marginTop: vs(24),
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(8),
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listContent: {
    paddingHorizontal: s(16),
    paddingBottom: vs(24),
    paddingTop: vs(8),
  },
  row: {
    justifyContent: 'space-between',
  },
  // StoreCard styles
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(16),
    borderWidth: 0.5,
    gap: s(16),
  },
  storeIcon: {
    width: ms(56),
    height: ms(56),
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
  },
  // CategoryChip styles
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
  },
});
