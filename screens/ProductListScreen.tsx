import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import ProductList from '@/src/components/ProductList';
import { type Product } from '@/src/components/ProductCard';

// ─── Datos de prueba ─────────────────────────────────────────────────────────
// Reemplazá esto con tu hook de API cuando el backend esté listo.
const MOCK_PRODUCTS: Product[] = [
  {
    id:       '1',
    name:     'Vasija de barro pintada a mano',
    artisan:  'Taller de doña Carmen',
    price:    18500,
    currency: 'CRC',
    imageUri: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
    status:   'available',
    category: 'Cerámica',
  },
  {
    id:       '2',
    name:     'Mochila tejida en lana virgen',
    artisan:  'Tejidos Kikö',
    price:    32000,
    currency: 'CRC',
    imageUri: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    status:   'new',
    category: 'Téxtiles',
  },
  {
    id:       '3',
    name:     'Cuadro acrílico paisaje Guanacaste',
    artisan:  'Estudio Viento del Norte',
    price:    45000,
    currency: 'CRC',
    imageUri: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
    status:   'available',
    category: 'Pinturas',
  },
  {
    id:       '4',
    name:     'Joyero de madera de cedro',
    artisan:  'Don Juan Maderas',
    price:    12500,
    currency: 'CRC',
    imageUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    status:   'sold_out',
    category: 'Madera',
  },
  {
    id:       '5',
    name:     'Canasta de palma tejida',
    artisan:  'Artesanías del Sur',
    price:    8900,
    currency: 'CRC',
    imageUri: 'https://images.unsplash.com/photo-1606170033648-5d55a3edf314?w=400',
    status:   'available',
    category: 'Cestería',
  },
  {
    id:       '6',
    name:     'Aretes de tagua pintados',
    artisan:  'Joyería Verde',
    price:    5500,
    currency: 'CRC',
    imageUri: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=400',
    status:   'pending',
    category: 'Joyería',
  },
];

interface Props {
  onSelectProduct?: (id: string) => void;
}

export default function ProductListScreen({ onSelectProduct }: Props) {
  const { colors, spacing } = useTheme();

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bgPage }}
    >
      <ProductList
        products={MOCK_PRODUCTS}
        onSelectProduct={onSelectProduct ?? (() => {})}
        title="Nuestros productos"
        numColumns={2}
      />
    </SafeAreaView>
  );
}
