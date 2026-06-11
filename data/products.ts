// ─── Fuente única de datos de producto (mock) ─────────────────────────────────
// Reemplazar con llamadas a la API cuando el backend esté listo.
// Tanto ProductListScreen como la ruta /producto/[id] importan de aquí
// para garantizar consistencia sin prop-drilling ni estado global.

import { type Product } from '@/src/components/ProductCard';
import { type ProductDetail } from '@/screens/ProductDetailScreen';

// Versión enriquecida que incluye todos los campos del detalle
export interface FullProduct extends Product {
  shortDescription: string;
  description:      string;
  images:           string[];
  artisanBio?:      string;
  materials?:       string[];
  dimensions?:      string;
  leadTime?:        string;
}

export const MOCK_PRODUCTS: FullProduct[] = [
  {
    id:               '1',
    name:             'Vasija de barro pintada a mano',
    artisan:          'Taller de doña Carmen',
    price:            18500,
    currency:         'CRC',
    imageUri:         'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
    status:           'available',
    category:         'Cerámica',
    shortDescription: 'Vasija de tradición Chorotega en cobalto y ocre.',
    description:      'Pieza artesanal única elaborada con barro negro de la región de Guanacaste. Cada vasija es pintada a mano con motivos precolombinos de la cultura Chorotega, utilizando pigmentos naturales de cobalto y ocre.',
    images:           [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
      'https://images.unsplash.com/photo-1490312278390-ab64016e9b5b?w=800',
    ],
    artisanBio:  'Doña Carmen lleva más de 35 años trabajando el barro negro en su taller familiar en Guaitil, Santa Cruz. Sus piezas han sido reconocidas en ferias artesanales de toda Centroamérica.',
    materials:   ['Barro negro', 'Pigmentos naturales', 'Barniz orgánico'],
    dimensions:  '22 cm × 14 cm',
    leadTime:    '5-7 días hábiles',
  },
  {
    id:               '2',
    name:             'Mochila tejida en lana virgen',
    artisan:          'Tejidos Kikö',
    price:            32000,
    currency:         'CRC',
    imageUri:         'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    status:           'new',
    category:         'Téxtiles',
    shortDescription: 'Tejido a mano en lana virgen de alpaca con tintura natural.',
    description:      'Mochila tejida con la técnica de telar ancestral de Sarchí. Confeccionada en lana virgen de alpaca teñida con añil y cochinilla. Resistente y exclusiva, perfecta para uso diario o como pieza de colección.',
    images:           [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    ],
    artisanBio:  'El Taller Kikö, fundado en 1998, es un emprendimiento familiar de la ciudad de Sarchí que ha preservado técnicas de tejido con más de 200 años de historia.',
    materials:   ['Lana virgen de alpaca', 'Tintes naturales (añil, cochinilla)'],
    dimensions:  '40 cm × 30 cm × 12 cm',
    leadTime:    '10-14 días hábiles',
  },
  {
    id:               '3',
    name:             'Cuadro acrílico paisaje Guanacaste',
    artisan:          'Estudio Viento del Norte',
    price:            45000,
    currency:         'CRC',
    imageUri:         'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
    status:           'available',
    category:         'Pinturas',
    shortDescription: 'Óleo sobre tela de los paisajes secos de Guanacaste.',
    description:      'Obra original en acrílico sobre tela de algodón estirada sobre bastidor de madera de cedro. Captura los tonos dorados y ocres característicos de la estación seca en la provincia de Guanacaste.',
    images:           [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
    ],
    materials:  ['Acrílico sobre tela', 'Bastidor de cedro'],
    dimensions: '60 cm × 80 cm',
    leadTime:   '3-5 días hábiles',
  },
  {
    id:               '4',
    name:             'Joyero de madera de cedro',
    artisan:          'Don Juan Maderas',
    price:            12500,
    currency:         'CRC',
    imageUri:         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    status:           'sold_out',
    category:         'Madera',
    shortDescription: 'Tallado a mano en cedro costarricense con incrustaciones.',
    description:      'Joyero artesanal elaborado en cedro real costarricense, tallado y pulido a mano. Incluye compartimentos interiores forrados en tela de seda natural. Cada pieza es única por las vetas naturales de la madera.',
    images:           [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    ],
    artisanBio:  'Don Juan es uno de los últimos maestros carpinteros artesanales del Valle Central. Aprendió el oficio de su padre y lleva 40 años creando objetos de madera en su taller de Escazú.',
    materials:  ['Cedro real', 'Seda natural', 'Cera de abeja'],
    dimensions: '25 cm × 15 cm × 8 cm',
    leadTime:   'Actualmente agotado',
  },
  {
    id:               '5',
    name:             'Canasta de palma tejida',
    artisan:          'Artesanías del Sur',
    price:            8900,
    currency:         'CRC',
    imageUri:         'https://images.unsplash.com/photo-1606170033648-5d55a3edf314?w=600',
    status:           'available',
    category:         'Cestería',
    shortDescription: 'Tejida en palma real con técnica ancestral del Pacífico Sur.',
    description:      'Canasta elaborada con palma real seca, recolectada de forma sostenible en las comunidades del Pacífico Sur de Costa Rica. El tejido sigue una técnica transmitida de generación en generación.',
    images:           [
      'https://images.unsplash.com/photo-1606170033648-5d55a3edf314?w=800',
    ],
    materials:  ['Palma real', 'Tintes vegetales'],
    dimensions: '30 cm de diámetro × 20 cm de alto',
    leadTime:   '3-5 días hábiles',
  },
  {
    id:               '6',
    name:             'Aretes de tagua pintados',
    artisan:          'Joyería Verde',
    price:            5500,
    currency:         'CRC',
    imageUri:         'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600',
    status:           'pending',
    category:         'Joyería',
    shortDescription: 'Tallados en tagua y pintados a mano con esmalte vegetal.',
    description:      'Aretes colgantes elaborados en tagua (marfil vegetal), tallados a mano y pintados con esmaltes libres de tóxicos. Cada par es único e irrepetible. Incluyen ganchos de plata 925.',
    images:           [
      'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800',
    ],
    materials:   ['Tagua (marfil vegetal)', 'Plata 925', 'Esmalte vegetal'],
    dimensions:  '4 cm × 1.5 cm',
    leadTime:    '7-10 días hábiles (bajo encargo)',
  },
];

// Utilidad para buscar un producto por ID
export function findProduct(id: string): FullProduct | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}
