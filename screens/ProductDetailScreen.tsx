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

// ─── Tipos ───────────────────────────────────────────────────────────────────
export interface ProductDetail {
  id:          string;
  name:        string;
  artisan:     string;
  artisanBio?: string;
  price:       number;
  currency:    string;
  images:      string[];
  status:      BadgeStatus;
  category:    string;
  description: string;
  materials?:  string[];
  dimensions?: string;
  leadTime?:   string;
}

interface Props {
  product:     ProductDetail;
  onAddToCart: (id: string) => void;
  onBuyNow:    (id: string) => void;
  onBack?:     () => void;
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
// No incluye header de navegación propio — React Navigation lo maneja.
// Configurá el header en tu Stack.Screen options:
//   headerStyle:      { backgroundColor: colors.bgNavbar }
//   headerTintColor:  colors.primary
//   headerTitleStyle: { fontFamily: 'DMSans_500Medium' }
export default function ProductDetailScreen({
  product,
  onAddToCart,
  onBuyNow,
}: Props) {
  const { colors, spacing } = useTheme();

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
          price={product.price}
          currency={product.currency}
          status={product.status}
          category={product.category}
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
        onBuyNow={onBuyNow}
        onAddToCart={onAddToCart}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  divider: {
    height:        0.5,
    marginVertical: 16,
  },
});
