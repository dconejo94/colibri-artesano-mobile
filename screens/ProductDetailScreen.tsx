import { useState, useEffect, useMemo } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import {
  DetailGallery,
  DetailHeader,
  DetailInfo,
  DetailArtisanBio,
  DetailActionBar,
  DetailVariantPicker,
} from '@/src/components/Detail';
import { type BadgeStatus } from '@/src/components/StatusBadge';
import ErrorBanner from '@/src/components/ErrorBanner';
import { type ApiError } from '@/src/api/errors';
import type { ProductVariant } from '@/types/store';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ProductDetail {
  id: string;
  name: string;
  artisan: string;
  artisanStoreId?: string;
  artisanBio?: string;
  price: number;
  currency: string;
  images: string[];
  status: BadgeStatus;
  category: string;
  description: string;
  materials?: string[];
  dimensions?: string;
  leadTime?: string;
  variants: ProductVariant[];
}

interface Props {
  product: ProductDetail | null;
  error?: ApiError | null;
  onRetry?: () => void;
  onAddToCart: (id: string, variantId: string | null) => void;
  onBuyNow: (id: string, variantId: string | null) => void;
  onBack?: () => void;
  onArtisanPress?: (storeId: string) => void;
}

// ─── Screen ─────────────────────────────────────────────────────────────────
// Has no navigation header of its own — React Navigation handles it.
// Configure the header in your Stack.Screen options:
//   headerStyle:      { backgroundColor: colors.bgNavbar }
//   headerTintColor:  colors.primary
//   headerTitleStyle: { fontFamily: 'DMSans_500Medium' }
export default function ProductDetailScreen({
  product,
  error,
  onRetry,
  onAddToCart,
  onBuyNow,
  onArtisanPress,
}: Props) {
  const { colors, spacing } = useTheme();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Auto-select the sole variant (nothing to choose); reset selection when
  // the product itself changes so a stale variant from a previous product
  // never leaks into a new one.
  useEffect(() => {
    if (product?.variants.length === 1) {
      setSelectedVariantId(product.variants[0].id);
    } else {
      setSelectedVariantId(null);
    }
  }, [product?.id, product?.variants]);

  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product, selectedVariantId]
  );

  const effectivePrice = product
    ? product.price + (selectedVariant ? Number(selectedVariant.price_modifier) || 0 : 0)
    : 0;

  const needsVariantChoice = (product?.variants.length ?? 0) > 1 && !selectedVariantId;

  // No product (load failed, no network, etc.): rendering an empty
  // gallery/header/action bar makes no sense, so replace the whole content.
  if (!product) {
    return (
      <SafeAreaView
        edges={['top']}
        style={[styles.screen, { backgroundColor: colors.bgPage }]}
      >
        <ErrorBanner
          error={error ?? { status: 0, message: 'No se pudo cargar el producto.' }}
          onRetry={onRetry}
          variant="centered"
        />
      </SafeAreaView>
    );
  }

  return (
    // SafeAreaView only covers the top — the action bar handles its own bottom
    <SafeAreaView
      edges={['top']}
      style={[styles.screen, { backgroundColor: colors.bgPage }]}
    >
      {/* ScrollView + action bar are direct children so the bar stays sticky */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing[10] }}
      >
        {/* Image gallery */}
        <DetailGallery images={product.images} />

        {/* Name, artisan, price, badge */}
        <DetailHeader
          name={product.name}
          artisan={product.artisan}
          price={effectivePrice}
          currency={product.currency}
          status={product.status}
          category={product.category}
          onArtisanPress={
            product.artisanStoreId && onArtisanPress
              ? () => onArtisanPress(product.artisanStoreId!)
              : undefined
          }
        />

        {/* Variant picker — only shown when there's more than one */}
        <DetailVariantPicker
          variants={product.variants}
          selectedId={selectedVariantId}
          onSelect={setSelectedVariantId}
        />

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border, marginHorizontal: spacing[4] }]} />

        {/* Description and technical details */}
        <DetailInfo
          description={product.description}
          materials={product.materials}
          dimensions={product.dimensions}
          leadTime={product.leadTime}
        />

        {/* Artisan bio — only if present */}
        {product.artisanBio && (
          <DetailArtisanBio
            artisan={product.artisan}
            artisanBio={product.artisanBio}
          />
        )}
      </ScrollView>

      {/* Action bar — sticky at the bottom */}
      <DetailActionBar
        productId={product.id}
        status={product.status}
        disabled={needsVariantChoice}
        onBuyNow={(id) => onBuyNow(id, selectedVariantId)}
        onAddToCart={(id) => onAddToCart(id, selectedVariantId)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  divider: {
    height: 0.5,
    marginVertical: 16,
  },
});