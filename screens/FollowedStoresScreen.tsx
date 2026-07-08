import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import Header from '@/components/ui/Header';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import LoadingState from '@/components/ui/LoadingState';
import ErrorBanner from '@/src/components/ErrorBanner';
import SearchBar from '@/src/components/SearchBar';
import Button from '@/components/ui/Button';
import FollowButton from '@/src/components/FollowButton';

import { useTheme, fonts } from '@/src/theme';
import { getFollowedStores } from '@/api/users';
import type { Store } from '@/types/store';
import { normalizeError, type ApiError } from '@/src/api/errors';
import { useFocusEffect } from 'expo-router';
import { s, vs, ms } from '@/utils/scale';

export default function FollowedStoresScreen() {
  const { colors, spacing, radii, shadows, text } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const [stores, setStores] = useState<Store[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchStores = useCallback(async (p = 1, append = false) => {
    if (p === 1) setIsLoading(true);
    setError(null);
    try {
      const res = await getFollowedStores(p, 10);
      setStores(append ? (prev) => [...prev, ...res.items] : res.items);
      setTotal(res.total);
      setPage(p);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchStores(1); }, [fetchStores]));

  const fetchNextPage = () => {
    if (stores.length < total) {
      fetchStores(page + 1, true);
    }
  };

  const renderItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={[styles.storeCard, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.sm }]}
      onPress={() => router.push(`/tienda/${item.id}` as any)}
      activeOpacity={0.8}
    >
      <View style={[styles.storeIcon, { backgroundColor: colors.bgSection, borderRadius: radii.md }]}>
        <MaterialIcons name="storefront" size={ms(28)} color={colors.primary} />
      </View>
      <View style={styles.storeInfo}>
        <Text style={[text.h3, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[text.body, { color: colors.textSecondary, marginTop: vs(2) }]} numberOfLines={2}>
          {item.description || 'Sin descripción'}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={ms(24)} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <Header onMenuPress={() => setMenuOpen(true)} />

      <View style={{ flex: 1 }}>
        <Text style={[text.h2, { color: colors.primaryDeep, marginHorizontal: s(16), marginTop: vs(8), marginBottom: vs(16) }]}>
          Emprendedores
        </Text>

        <View style={{ paddingHorizontal: s(16), paddingBottom: vs(16), zIndex: 50 }}>
          <SearchBar scope="stores" locked={true} />
        </View>

        {error && stores.length > 0 && (
          <ErrorBanner error={error} onRetry={() => fetchStores(page + 1, true)} />
        )}

        {isLoading && stores.length === 0 ? (
          <LoadingState message="Cargando tiendas..." />
        ) : error && stores.length === 0 ? (
          <ErrorBanner error={error} onRetry={() => fetchStores(1)} variant="centered" />
        ) : stores.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="people-outline" size={ms(80)} color={colors.primarySoft} />
            <Text style={[text.h2, { color: colors.primaryDeep, marginTop: vs(16), textAlign: 'center' }]}>
              No sigues a ninguna tienda
            </Text>
            <Text style={[text.body, { color: colors.textSecondary, marginTop: vs(8), textAlign: 'center' }]}>
              Explora nuestros productos y apoya a tus artesanos favoritos.
            </Text>
            <View style={{ marginTop: vs(24) }}>
              <Button
                title="Explorar productos"
                onPress={() => router.push('/productos' as any)}
              />
            </View>
          </View>
        ) : (
          <FlatList
            data={stores}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onEndReached={fetchNextPage}
            onEndReachedThreshold={0.3}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: s(16),
    paddingBottom: vs(24),
    gap: vs(12),
  },
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(32),
  },
});
