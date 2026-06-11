import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTheme } from '@/src/theme';
import ProductList from '@/src/components/ProductList';
import { MOCK_PRODUCTS } from '@/data/products';

export default function ProductListScreen() {
  const { colors } = useTheme();
  const router     = useRouter();

  const handleObtain = (id: string) => {
    router.push(`/producto/${id}` as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <ProductList
        products={MOCK_PRODUCTS}
        onSelectProduct={handleObtain}
        onObtainProduct={handleObtain}
        title="Nuestros productos"
        numColumns={1}
      />
    </View>
  );
}
