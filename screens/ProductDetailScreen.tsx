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

// ─── Pantalla ─────────────────────────────────────────────────────────────────
// No incluye header de navegación propio — React Navigation lo maneja.
// Configurá el header en tu Stack.Screen options:
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

  return (
    // SafeAreaView solo cubre top — la action bar maneja su propio bottom
    <SafeAreaView
      edges={['top']}
      style={[styles.screen, { backgroundColor: colors.bgPage }]}
    >
      {/* ScrollView + action bar son hijos directos para que la barra quede sticky */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing[10] }}
      >
        {/* Galería de imágenes */}
        <DetailGallery images={product.images} />

        {/* Nombre, artesano, precio, badge */}
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

        {/* Selector de variante — solo se muestra si hay más de una */}
        <DetailVariantPicker
          variants={product.variants}
          selectedId={selectedVariantId}
          onSelect={setSelectedVariantId}
        />

        {/* Separador */}
        <View style={[styles.divider, { backgroundColor: colors.border, marginHorizontal: spacing[4] }]} />

        {/* Descripción y ficha técnica */}
        <DetailInfo
          description={product.description}
          materials={product.materials}
          dimensions={product.dimensions}
          leadTime={product.leadTime}
        />

        {/* Bio del artesano — solo si está presente */}
        {product.artisanBio && (
          <DetailArtisanBio
            artisan={product.artisan}
            artisanBio={product.artisanBio}
          />
        )}
      </ScrollView>

      {/* Barra de acciones — sticky en el fondo */}
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