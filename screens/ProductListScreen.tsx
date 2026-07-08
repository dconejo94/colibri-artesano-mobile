import ErrorBanner from '@/src/components/ErrorBanner';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import Header from '@/components/ui/Header';
import LoadingState from '@/components/ui/LoadingState';
import ProductList from '@/src/components/ProductList';
import { useProducts } from '@/src/hooks/useProducts';
import { useTheme } from '@/src/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import CategoryPicker from '@/components/ui/CategoryPicker';
import Input from '@/components/ui/Input';
import { getCategories } from '@/api/categories';
import type { Category } from '@/types/store';
import { s, vs, ms } from '@/utils/scale';

export default function ProductListScreen() {
  const { colors, text, radii } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const params = useLocalSearchParams();
  const initialCategoryId = (params.categoryId as string) || null;

  // Filters State
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [debouncedMinPrice, setDebouncedMinPrice] = useState<number | undefined>(undefined);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState<number | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(!!initialCategoryId);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.items)).catch(() => {});
  }, []);

  // Debounce inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
      setDebouncedMinPrice(minPrice ? parseFloat(minPrice) : undefined);
      setDebouncedMaxPrice(maxPrice ? parseFloat(maxPrice) : undefined);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, minPrice, maxPrice]);

  const { products, isLoading, error, fetchNextPage, hasNextPage, refetch } = useProducts({ 
    limit: 10,
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    minPrice: debouncedMinPrice,
    maxPrice: debouncedMaxPrice
  });

  const handleObtain = (id: string) => {
    router.push(`/producto/${id}` as any);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <Header onMenuPress={() => setMenuOpen(true)} />

      <View style={{ flex: 1 }}>
        {/* Filters */}
        <View style={[styles.filtersContainer, { backgroundColor: colors.bgSection, borderBottomColor: colors.border }]}>
          <View style={styles.searchRow}>
            <View style={[styles.searchBar, { backgroundColor: colors.bgInput, borderColor: colors.border, borderRadius: radii.md }]}>
              <MaterialIcons name="search" size={18} color={colors.textMuted} />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Buscar productos..."
                placeholderTextColor={colors.textMuted}
                style={[styles.searchInput, { color: colors.textPrimary }]}
              />
            </View>
            <Pressable 
              style={[styles.filterBtn, { backgroundColor: showFilters ? colors.primarySoft : colors.bgInput, borderColor: colors.border, borderRadius: radii.md }]} 
              onPress={() => setShowFilters(!showFilters)}
            >
              <MaterialIcons name="tune" size={20} color={showFilters ? colors.primaryDeep : colors.textPrimary} />
            </Pressable>
          </View>

          {showFilters && (
            <View style={styles.expandedFilters}>
              {categories.length > 0 && (
                <View style={{ marginBottom: vs(8) }}>
                  <CategoryPicker
                    categories={categories}
                    selectedId={categoryId}
                    onSelect={(id) => setCategoryId(id === categoryId ? null : id)} // toggleable
                  />
                </View>
              )}
              <View style={styles.priceRow}>
                <View style={{ flex: 1 }}>
                  <Input 
                    label="Precio Mínimo" 
                    value={minPrice} 
                    onChangeText={setMinPrice} 
                    keyboardType="numeric" 
                    placeholder="₡0" 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input 
                    label="Precio Máximo" 
                    value={maxPrice} 
                    onChangeText={setMaxPrice} 
                    keyboardType="numeric" 
                    placeholder="₡Sin límite" 
                  />
                </View>
              </View>
            </View>
          )}
        </View>
        {/* Compact banner: only when products are already on screen (e.g. the next page failed) */}
        {error && products.length > 0 && (
          <ErrorBanner error={error} onRetry={refetch} />
        )}

        {isLoading && products.length === 0 ? (
          <LoadingState message="Cargando productos..." />
        ) : error && products.length === 0 ? (
          // Full-screen state: centered icon + message + retry button
          <ErrorBanner error={error} onRetry={refetch} variant="centered" />
        ) : (
          <ProductList
            products={products}
            onSelectProduct={handleObtain}
            onObtainProduct={handleObtain}
            onArtisanPress={(storeId) => router.push(`/tienda/${storeId}` as any)}
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

const styles = StyleSheet.create({
  filtersContainer: {
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    borderBottomWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    gap: s(10),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    height: ms(42),
    borderWidth: 1,
    gap: s(8),
  },
  searchInput: {
    flex: 1,
    fontSize: ms(14),
    padding: 0,
  },
  filterBtn: {
    width: ms(42),
    height: ms(42),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  expandedFilters: {
    marginTop: vs(12),
    gap: vs(4),
  },
  priceRow: {
    flexDirection: 'row',
    gap: s(12),
  }
});