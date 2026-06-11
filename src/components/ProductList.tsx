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

interface Props {
  products:        Product[];
  onSelectProduct: (id: string) => void;
  onObtainProduct: (id: string) => void;  // botón "Obtener" en cada card
  isLoading?:      boolean;
  title?:          string;
  numColumns?:     number;
}

export default function ProductList({
  products,
  onSelectProduct,
  onObtainProduct,
  isLoading  = false,
  title,
  numColumns = 1,   // default 1 para el diseño rico de card
}: Props) {
  const { colors, spacing, text } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const HORIZONTAL_PADDING = spacing[4] * 2;
  const GAP                = spacing[3];
  const cardWidth =
    (screenWidth - HORIZONTAL_PADDING - GAP * (numColumns - 1)) / numColumns;

  // Header con título + underline de acento
  const ListHeader = title ? (
    <View style={[styles.titleRow, { marginBottom: spacing[5] }]}>
      <Text style={[text.h2, { color: colors.primaryDeep }]}>{title}</Text>
      <View style={[styles.titleUnderline, { backgroundColor: colors.accent }]} />
    </View>
  ) : null;

  // Estado vacío / loading
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
      key={`cols-${numColumns}`}
      data={products}
      numColumns={numColumns}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.container,
        { paddingHorizontal: spacing[4], paddingBottom: spacing[10] },
      ]}
      columnWrapperStyle={numColumns > 1 ? { gap: GAP } : undefined}
      ItemSeparatorComponent={() => <View style={{ height: spacing[4] }} />}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={ListEmpty}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={onSelectProduct}
          onObtain={onObtainProduct}
          width={numColumns === 1 ? cardWidth : cardWidth}
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
    gap: 8,
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
