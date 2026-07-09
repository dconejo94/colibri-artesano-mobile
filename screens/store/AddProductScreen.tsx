import { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { s, vs } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { createProduct, addProductVariant } from "@/api/products";
import { getCategories } from "@/api/categories";
import type { Category } from "@/types/store";
import { normalizeError, type ApiError } from "@/src/api/errors";
import ErrorBanner from "@/src/components/ErrorBanner";
import SubHeader from "@/components/ui/SubHeader";
import CategoryPicker from "@/components/ui/CategoryPicker";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AddProductScreen() {
  const { colors, spacing, radii, shadows, text } = useTheme();
  const router = useRouter();
  const { storeId } = useLocalSearchParams<{ storeId: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<ApiError | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loadCategories = useCallback(async () => {
    setCatLoading(true);
    setCatError(null);
    try {
      const res = await getCategories(1, 50);
      setCategories(res.items);
      setCategoryId(res.items.length > 0 ? res.items[0].id : null);
    } catch (err) {
      setCatError(normalizeError(err));
      setCategories([]);
    } finally {
      setCatLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const clearError = (key: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      // Only dismiss the "Revisa los datos ingresados." banner once every
      // field error it summarizes has actually been resolved.
      if (Object.keys(next).length === 0) setError(null);
      return next;
    });
  };

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "El nombre del producto es requerido.";
    if (!basePrice.trim()) nextErrors.base_price = "El precio base es requerido.";
    else {
      const price = parseFloat(basePrice);
      if (isNaN(price) || price < 0) nextErrors.base_price = "El precio debe ser un número válido.";
    }
    if (!categoryId) nextErrors.category_id = "Debes seleccionar una categoría.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError({ status: 422, message: "Revisa los datos ingresados." });
      return;
    }
    if (!storeId) return;

    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const price = parseFloat(basePrice);
      const createdProduct = await createProduct(storeId, {
        category_id: categoryId!,
        name: name.trim(),
        description: description.trim(),
        base_price: price,
      });

      // Auto-create a default variant so the product is buyable immediately.
      // This is a separate try/catch: the product itself was already created
      // successfully by this point, so a failure here must NOT surface as a
      // generic "creation failed" error (that would invite the vendor to
      // resubmit the form and create a duplicate product). Instead we still
      // navigate to EditProductScreen, where a variant can be added manually.
      try {
        await addProductVariant(createdProduct.id, {
          name: "Variante",
          value: "Única",
          price_modifier: 0,
          stock_quantity: 1,
        });
      } catch {
        Toast.show({
          type: "error",
          text1: "Producto creado, pero falló la variante inicial",
          text2: "Agrega una variante manualmente desde esta pantalla.",
        });
      }

      // Navigate to EditProductScreen so vendor can add images and adjust variants
      router.replace({
        pathname: "/store/products/[id]" as never,
        params: { id: createdProduct.id, storeId }
      });
    } catch (err) {
      const apiErr = normalizeError(err);
      const isTransient = apiErr.status === null || apiErr.status >= 500;

      // Network/5xx errors are already reported by the interceptor's global
      // toast (client.ts, only fires for mutations). Showing the banner here
      // too would be a duplicate notice of the same error.
      if (!isTransient) {
        setError(apiErr);
        if (apiErr.fieldErrors) {
          setFieldErrors(apiErr.fieldErrors);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SubHeader title="Nuevo producto" onBack={() => router.back()} />

      {catLoading ? (
        <View style={local.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : categories.length === 0 ? (
        // No categories (due to error or because none exist yet): no point
        // letting the user fill out a form that can never be submitted.
        <ErrorBanner
          error={catError ?? { status: 0, message: "No hay categorías disponibles para crear un producto." }}
          onRetry={loadCategories}
          variant="centered"
        />
      ) : (
        <ScrollView contentContainerStyle={local.content} keyboardShouldPersistTaps="handled">
          <View style={[local.card, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.md }]}>
            <ErrorBanner error={error} onDismiss={() => setError(null)} />
            <Input label="Nombre del producto *" value={name} onChangeText={(t) => { setName(t); clearError("name"); }} placeholder="Ej: Vasija de Barro" error={fieldErrors.name} />
            <Input label="Descripción" value={description} onChangeText={setDescription} placeholder="Describe tu producto..." multiline />
            <Input label="Precio base *" value={basePrice} onChangeText={(t) => { setBasePrice(t); clearError("base_price"); }} placeholder="₡" keyboardType="numeric" error={fieldErrors.base_price} />

            <CategoryPicker
              categories={categories}
              selectedId={categoryId}
              onSelect={(id) => { setCategoryId(id); clearError("category_id"); }}
              loading={catLoading}
            />

            <Button
              title={saving ? "Guardando..." : "Crear producto"}
              onPress={handleSubmit}
              disabled={saving}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  content: { padding: s(16), paddingBottom: vs(40) },
  card: { padding: s(20), gap: vs(16), borderWidth: 0.5 },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
});