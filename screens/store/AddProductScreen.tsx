import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { s, vs } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { createProduct } from "@/api/products";
import { getCategories } from "@/api/categories";
import type { Category } from "@/types/store";
import SubHeader from "@/components/ui/SubHeader";
import CategoryPicker from "@/components/ui/CategoryPicker";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Text } from "react-native";

export default function AddProductScreen() {
  const { colors, spacing, radii, shadows, text } = useTheme();
  const router = useRouter();
  const { storeId } = useLocalSearchParams<{ storeId: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCategories(1, 50);
        setCategories(res.items);
        if (res.items.length > 0) setCategoryId(res.items[0].id);
      } catch { /* silent */ } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!storeId || !categoryId || !name.trim() || !basePrice.trim()) return;
    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) {
      setError("El precio debe ser un número válido.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createProduct(storeId, {
        category_id: categoryId,
        name: name.trim(),
        description: description.trim(),
        base_price: price,
      });
      router.back();
    } catch {
      setError("No se pudo crear el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <SubHeader title="Agregar producto" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={local.content} keyboardShouldPersistTaps="handled">
        <View style={[local.card, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.md }]}>
          <Input label="Nombre del producto" value={name} onChangeText={setName} placeholder="Ej: Vasija de Barro" />
          <Input label="Descripción" value={description} onChangeText={setDescription} placeholder="Describe tu producto..." multiline />
          <Input label="Precio base (colones)" value={basePrice} onChangeText={setBasePrice} placeholder="25000" keyboardType="numeric" />

          <CategoryPicker
            categories={categories}
            selectedId={categoryId}
            onSelect={setCategoryId}
            loading={catLoading}
          />

          {error && <Text style={[text.body, { color: colors.errorText, marginVertical: spacing[2] }]}>{error}</Text>}

          <Button
            title={saving ? "Guardando..." : "Crear producto"}
            onPress={handleSubmit}
            disabled={saving || !name.trim() || !basePrice.trim() || !categoryId}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  content: { padding: s(16), paddingBottom: vs(40) },
  card: { padding: s(20), gap: vs(16), borderWidth: 0.5 },
});
