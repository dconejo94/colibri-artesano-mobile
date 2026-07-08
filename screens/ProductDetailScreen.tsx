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
import type { ProductVariant } from '@/types/store';

// ─── Tipos ───────────────────────────────────────────────────────────────────
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
  variants?: ProductVariant[];
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

// ─── Pantalla ─────────────────────────────────────────────────────────────────
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

  // Sin producto (falló la carga, sin red, etc.): no tiene sentido renderizar
  // la galería/header/action bar vacíos, así que reemplazamos todo el contenido.
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

  const defaultVariantId = product.variants?.[0]?.id;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bgPage }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing[10] }}>
        <DetailGallery images={product.images} />

        <DetailHeader
          name={product.name}
          artisan={product.artisan}
          price={effectivePrice}
          currency={product.currency}
          status={product.status}
          category={product.category}
        />

        {/* Separador */}
        <View style={[styles.divider, { backgroundColor: colors.border, marginHorizontal: spacing[4] }]} />

        <DetailInfo
          description={product.description}
          materials={product.materials}
          dimensions={product.dimensions}
          leadTime={product.leadTime}
        />

        {product.artisanBio && (
          <DetailArtisanBio artisan={product.artisan} artisanBio={product.artisanBio} />
        )}
      </ScrollView>

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
  screen: { flex: 1 },
  divider: { height: 0.5, marginVertical: 16 },
});