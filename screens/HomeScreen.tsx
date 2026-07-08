import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/src/theme';
import { useProducts } from '@/src/hooks/useProducts';
import { useEvents } from '@/src/hooks/useEvents';
import Header from '@/components/ui/Header';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import ProductPill from '@/src/components/ProductPill';
import EventCard from '@/src/components/EventCard';
import ErrorBanner from '@/src/components/ErrorBanner';
import SearchBar from '@/src/components/SearchBar';
import { useConnectivityStore } from '@/src/store/connectivityStore';
import { useCartStore } from '@/src/store/cartStore';
import { useNotificationsStore } from '@/src/store/notificationsStore';

const PRODUCTS_PREVIEW_COUNT = 5;
const EVENTS_PREVIEW_COUNT = 3;

export default function HomeScreen() {
  const { colors, spacing, fonts, radii, text } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const isOnline = useConnectivityStore((s) => s.isOnline);
  const cartCount = useCartStore((s) => s.count);
  const refreshCart = useCartStore((s) => s.refresh);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const refreshUnread = useNotificationsStore((s) => s.refresh);
  const { products, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts({ limit: PRODUCTS_PREVIEW_COUNT });
  const { events, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEvents({ limit: EVENTS_PREVIEW_COUNT });

  useFocusEffect(
    useCallback(() => {
      refreshCart();
      refreshUnread();
    }, [refreshCart, refreshUnread])
  );

  const goToProduct = (id: string) => router.push(`/producto/${id}` as any);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <Header
        onMenuPress={() => setMenuOpen(true)}
        onNotificationsPress={() => router.push('/notificaciones' as any)}
        onCartPress={() => router.push('/carrito' as any)}
        unreadCount={unreadCount}
        cartCount={cartCount}
      />

      <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[4], zIndex: 50 }}>
        <SearchBar scope="all" locked={false} />
      </View>

      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: colors.errorBg, borderColor: colors.errorText }]}>
          <MaterialIcons name="wifi-off" size={16} color={colors.errorText} />
          <Text style={[styles.offlineText, { color: colors.errorText, fontFamily: fonts.sanBold }]}>
            Sin conexión — algunas funciones no están disponibles
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: spacing[8] }} showsVerticalScrollIndicator={false}>
        {/* ── Productos ── */}
        <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[5] }}>
          <SectionHeader title="Productos" onSeeAll={() => router.push('/productos' as any)} />

          {productsLoading && products.length === 0 ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing[3] }} />
          ) : productsError && products.length === 0 ? (
            <ErrorBanner error={productsError} onRetry={refetchProducts} />
          ) : products.length === 0 ? (
            <Text style={[text.body, { color: colors.textMuted, marginTop: spacing[3] }]}>
              No hay productos disponibles todavía.
            </Text>
          ) : (
            <View style={{ marginTop: spacing[3], gap: spacing[2] }}>
              {products.map((product) => (
                <ProductPill key={product.id} product={product} onPress={goToProduct} />
              ))}
            </View>
          )}
        </View>

        {/* ── Eventos próximos ── */}
        <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[6] }}>
          <SectionHeader title="Eventos próximos" onSeeAll={() => router.push('/eventos' as any)} />

          {eventsLoading && events.length === 0 ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing[3] }} />
          ) : eventsError && events.length === 0 ? (
            <ErrorBanner error={eventsError} onRetry={refetchEvents} />
          ) : events.length === 0 ? (
            <Text style={[text.body, { color: colors.textMuted, marginTop: spacing[3] }]}>
              No hay eventos programados por ahora.
            </Text>
          ) : (
            <View style={{ marginTop: spacing[3], gap: spacing[3] }}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} onPress={() => router.push(`/eventos/${event.id}` as any)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  const { colors, text } = useTheme();
  return (
    <View style={styles.sectionHeaderRow}>
      <View>
        <Text style={[text.h2, { color: colors.primaryDeep }]}>{title}</Text>
        <View style={[styles.underline, { backgroundColor: colors.accent }]} />
      </View>
      <Pressable onPress={onSeeAll} hitSlop={8}>
        <Text style={[text.label, { color: colors.primary }]}>Ver todos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  offlineText: {
    fontSize: 13,
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  underline: {
    height: 3,
    width: 34,
    borderRadius: 2,
    marginTop: 7,
  },
});
