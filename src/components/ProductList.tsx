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
  onArtisanPress?: (storeId: string) => void;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
  isLoading?:      boolean;
  title?:          string;
  titleSuffix?:    string;  // ej. "12 piezas", mostrado a la derecha del título
  numColumns?:     number;
  onEndReached?:   () => void;
}

export default function ProductList({
  products,
  onSelectProduct,
  onObtainProduct,
  onArtisanPress,
  onFavoriteToggle,
  isLoading  = false,
  title,
  titleSuffix,
  numColumns = 1,   // default 1 para el diseño rico de card
  onEndReached,
}: Props) {
  const { colors, spacing, text } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const HORIZONTAL_PADDING = spacing[4] * 2;
  const GAP                = spacing[3];
  const cardWidth =
    (screenWidth - HORIZONTAL_PADDING - GAP * (numColumns - 1)) / numColumns;

  // Header con título + underline de acento, y conteo opcional a la derecha
  const ListHeader = title ? (
    <View style={[styles.titleHeaderRow, { marginBottom: spacing[5] }]}>
      <View>
        <Text style={[text.h2, { color: colors.primaryDeep }]}>{title}</Text>
        <View style={[styles.titleUnderline, { backgroundColor: colors.accent }]} />
      </View>
      {!!titleSuffix && (
        <Text style={[text.caption, { color: colors.textMuted }]}>{titleSuffix}</Text>
      )}
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
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={onSelectProduct}
          onObtain={onObtainProduct}
          onArtisanPress={onArtisanPress}
          onFavoriteToggle={onFavoriteToggle}
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
  titleHeaderRow: {
    flexDirection:  'row',
    alignItems:     'flex-end',
    justifyContent: 'space-between',
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
