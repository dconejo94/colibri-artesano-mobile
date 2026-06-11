import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '@/src/theme';
import ProductCard, { type Product } from './ProductCard';

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface Props {
  products:        Product[];
  onSelectProduct: (id: string) => void;
  isLoading?:      boolean;
  title?:          string;
  numColumns?:     number;
}

// ─── Componente ──────────────────────────────────────────────────────────────
export default function ProductList({
  products,
  onSelectProduct,
  isLoading   = false,
  title,
  numColumns  = 2,
}: Props) {
  const { colors, spacing, text } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  // Ancho de cada card calculado para que la grilla encaje exactamente.
  // FlatList con numColumns no soporta gap de CSS — el espacio entre
  // columnas se aplica manualmente con marginRight en cada item.
  const HORIZONTAL_PADDING = spacing[4] * 2;  // 16 * 2 = 32
  const GAP = spacing[3];                      // 12
  const cardWidth =
    (screenWidth - HORIZONTAL_PADDING - GAP * (numColumns - 1)) / numColumns;

  // ─── Header: título con subrayado de acento cálido ────────────────────────
  const ListHeader = title ? (
    <View style={[styles.titleRow, { marginBottom: spacing[4] }]}>
      <Text style={[text.h3, { color: colors.primaryDeep }]}>{title}</Text>
      <View
        style={[styles.titleUnderline, { backgroundColor: colors.accent }]}
      />
    </View>
  ) : null;

  // ─── Estado vacío ─────────────────────────────────────────────────────────
  const ListEmpty = (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <Text style={[text.body, { color: colors.textMuted }]}>
          No hay productos disponibles.
        </Text>
      )}
    </View>
  );

  return (
    <FlatList
      // key cambia cuando numColumns cambia para evitar el error de React Native
      key={`cols-${numColumns}`}
      data={products}
      numColumns={numColumns}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.container,
        { paddingHorizontal: spacing[4], paddingBottom: spacing[10] },
      ]}
      columnWrapperStyle={numColumns > 1 ? { gap: GAP } : undefined}
      ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={ListEmpty}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={onSelectProduct}
          width={cardWidth}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    flexGrow:   1,
  },
  titleRow: {
    gap: 6,
  },
  titleUnderline: {
    height:       3,
    width:        40,
    borderRadius: 2,
  },
  emptyContainer: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 60,
  },
});
