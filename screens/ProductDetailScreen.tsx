import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import {
  DetailGallery,
  DetailHeader,
  DetailInfo,
  DetailArtisanBio,
  DetailActionBar,
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
  onAddToCart: (productId: string, variantId?: string) => void;
  onBuyNow: (productId: string, variantId?: string) => void;
  onBack?: () => void;
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function ProductDetailScreen({
  product,
  error,
  onRetry,
  onAddToCart,
  onBuyNow,
}: Props) {
  const { colors, spacing } = useTheme();

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
          price={product.price}
          currency={product.currency}
          status={product.status}
          category={product.category}
        />

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
        onBuyNow={() => onBuyNow(product.id, defaultVariantId)}
        onAddToCart={() => onAddToCart(product.id, defaultVariantId)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  divider: { height: 0.5, marginVertical: 16 },
});