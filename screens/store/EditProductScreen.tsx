import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { formatPrice } from "@/utils/format";
import shared from "@/constants/shared-styles";
import {
  getProduct,
  updateProduct,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  addProductImage,
} from "@/api/products";
import { getCategories } from "@/api/categories";
import type { Product, ProductVariant, Category } from "@/types/store";
import SubHeader from "@/components/ui/SubHeader";
import CategoryPicker from "@/components/ui/CategoryPicker";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function EditProductScreen() {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();
  const { id, storeId } = useLocalSearchParams<{ id: string; storeId: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [showVariantForm, setShowVariantForm] = useState(false);
  const [varName, setVarName] = useState("");
  const [varValue, setVarValue] = useState("");
  const [varPrice, setVarPrice] = useState("");
  const [varStock, setVarStock] = useState("");
  const [varSaving, setVarSaving] = useState(false);

  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState("");
  const [stockSaving, setStockSaving] = useState(false);

  const [showImageForm, setShowImageForm] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageSaving, setImageSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const [prod, catRes] = await Promise.all([
          getProduct(id),
          getCategories(1, 50),
        ]);
        setProduct(prod);
        setName(prod.name);
        setDescription(prod.description);
        setBasePrice(String(prod.base_price));
        setCategoryId(prod.category_id);
        setCategories(catRes.items);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSaveProduct = async () => {
    if (!id || !name.trim() || !basePrice.trim()) return;
    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) { setSaveError("Precio invalido."); return; }
    setSaving(true);
    setSaveError(null);
    setSaveMsg(null);
    try {
      const updated = await updateProduct(id, {
        name: name.trim(),
        description: description.trim(),
        base_price: price,
        category_id: categoryId ?? undefined,
      });
      setProduct((prev) => (prev ? { ...prev, ...updated } : updated));
      setSaveMsg("Producto actualizado");
    } catch {
      setSaveError("No se pudo actualizar.");
    } finally {
      setSaving(false);
    }
  };

  const confirmSaveProduct = () => {
    Alert.alert("Confirmar", "¿Guardar los cambios del producto?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Guardar", onPress: handleSaveProduct },
    ]);
  };

  const handleAddVariant = async () => {
    if (!id || !varName.trim() || !varValue.trim()) return;
    const priceMod = parseFloat(varPrice) || 0;
    const stock = parseInt(varStock, 10) || 0;
    setVarSaving(true);
    try {
      const variant = await addProductVariant(id, {
        name: varName.trim(),
        value: varValue.trim(),
        price_modifier: priceMod,
        stock_quantity: stock,
      });
      setProduct((prev) => prev ? { ...prev, variants: [...(prev.variants || []), variant] } : prev);
      setVarName(""); setVarValue(""); setVarPrice(""); setVarStock("");
      setShowVariantForm(false);
    } catch { /* silent */ } finally {
      setVarSaving(false);
    }
  };

  const confirmAddVariant = () => {
    Alert.alert("Confirmar", "¿Agregar nueva variante?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Agregar", onPress: handleAddVariant },
    ]);
  };

  const handleUpdateStock = async (variant: ProductVariant) => {
    if (!id) return;
    const qty = parseInt(editStock, 10);
    if (isNaN(qty) || qty < 0) return;
    setStockSaving(true);
    try {
      const updated = await updateProductVariant(id, variant.id, { stock_quantity: qty });
      setProduct((prev) => prev ? {
        ...prev,
        variants: (prev.variants || []).map((v) => v.id === variant.id ? updated : v),
      } : prev);
      setEditingVariantId(null);
      setEditStock("");
    } catch { /* silent */ } finally {
      setStockSaving(false);
    }
  };

  const confirmSaveStock = (variant: ProductVariant) => {
    Alert.alert("Confirmar", `¿Guardar cambios de stock para "${variant.value}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Guardar", onPress: () => handleUpdateStock(variant) },
    ]);
  };

  const handleStockDelta = (delta: number) => {
    const current = parseInt(editStock, 10) || 0;
    setEditStock(String(Math.max(0, current + delta)));
  };

  const handleDeleteVariant = (variant: ProductVariant) => {
    if (!id) return;
    Alert.alert("Eliminar variante", `Eliminar "${variant.name}: ${variant.value}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive", onPress: async () => {
          try {
            await deleteProductVariant(id, variant.id);
            setProduct((prev) => prev ? {
              ...prev,
              variants: (prev.variants || []).filter((v) => v.id !== variant.id),
            } : prev);
          } catch { /* silent */ }
        },
      },
    ]);
  };

  const handleAddImage = async () => {
    if (!id || !imageUrl.trim()) return;
    setImageSaving(true);
    try {
      const img = await addProductImage(id, { image_url: imageUrl.trim(), is_primary: (product?.images?.length ?? 0) === 0 });
      setProduct((prev) => prev ? { ...prev, images: [...(prev.images || []), img] } : prev);
      setImageUrl("");
      setShowImageForm(false);
    } catch { /* silent */ } finally {
      setImageSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={[shared.wrapper, isDark && shared.wrapperDark]}>
        <View style={shared.centered}>
          <ActivityIndicator size="large" color={isDark ? "#82A8AC" : "#6B9E98"} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[shared.wrapper, isDark && shared.wrapperDark]}>
      <SubHeader title="Editar producto" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={local.content} keyboardShouldPersistTaps="handled">
        {/* Product info section */}
        <View style={[shared.section, isDark && shared.sectionDark]}>
          <Text style={[shared.sectionTitle, isDark && shared.textDark]}>Información del producto</Text>
          <Input label="Nombre" value={name} onChangeText={(t) => { setName(t); setSaveMsg(null); }} placeholder="Nombre" />
          <Input label="Descripción" value={description} onChangeText={(t) => { setDescription(t); setSaveMsg(null); }} placeholder="Descripción" multiline />
          <Input label="Precio base" value={basePrice} onChangeText={(t) => { setBasePrice(t); setSaveMsg(null); }} placeholder="25000" keyboardType="numeric" />

          {categories.length > 0 && (
            <CategoryPicker
              categories={categories}
              selectedId={categoryId}
              onSelect={(id) => { setCategoryId(id); setSaveMsg(null); }}
            />
          )}

          {saveError && <Text style={shared.errorText}>{saveError}</Text>}
          {saveMsg && (
            <View style={shared.successRow}>
              <MaterialIcons name="check-circle" size={ms(16)} color="#10B981" />
              <Text style={shared.successText}>{saveMsg}</Text>
            </View>
          )}
          <Button title={saving ? "Guardando..." : "Guardar cambios"} onPress={confirmSaveProduct} disabled={saving || !name.trim()} />
        </View>

        {/* Images section */}
        <View style={[shared.section, isDark && shared.sectionDark]}>
          <View style={shared.sectionHeader}>
            <Text style={[shared.sectionTitle, isDark && shared.textDark]}>Imágenes</Text>
            <TouchableOpacity onPress={() => setShowImageForm(!showImageForm)}>
              <MaterialIcons name={showImageForm ? "close" : "add-circle"} size={ms(24)} color={isDark ? "#ACD4CD" : "#6B9E98"} />
            </TouchableOpacity>
          </View>
          {product?.images.length === 0 && !showImageForm && (
            <Text style={[shared.emptyText, isDark && shared.textMuted]}>Sin imágenes</Text>
          )}
          {product?.images.map((img) => (
            <View key={img.id} style={[local.imageRow, isDark && local.imageRowDark]}>
              <MaterialIcons name="image" size={ms(20)} color={isDark ? "#ACD4CD" : "#6B9E98"} />
              <Text style={[local.imageUrl, isDark && shared.textMuted]} numberOfLines={1}>{img.image_url}</Text>
              {img.is_primary && (
                <View style={local.primaryBadge}><Text style={local.primaryText}>Principal</Text></View>
              )}
            </View>
          ))}
          {showImageForm && (
            <View style={local.inlineForm}>
              <Input label="URL de imagen" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />
              <Button title={imageSaving ? "..." : "Agregar imagen"} onPress={handleAddImage} disabled={imageSaving || !imageUrl.trim()} />
            </View>
          )}
        </View>

        {/* Variants section */}
        <View style={[shared.section, isDark && shared.sectionDark]}>
          <View style={shared.sectionHeader}>
            <Text style={[shared.sectionTitle, isDark && shared.textDark]}>Variantes y stock</Text>
            <TouchableOpacity onPress={() => setShowVariantForm(!showVariantForm)}>
              <MaterialIcons name={showVariantForm ? "close" : "add-circle"} size={ms(24)} color={isDark ? "#ACD4CD" : "#6B9E98"} />
            </TouchableOpacity>
          </View>

          {product?.variants.length === 0 && !showVariantForm && (
            <Text style={[shared.emptyText, isDark && shared.textMuted]}>Sin variantes</Text>
          )}

          {product?.variants.map((v) => (
            <View key={v.id} style={[local.variantCard, isDark && local.variantCardDark]}>
              <View style={local.variantHeader}>
                <View style={local.variantInfo}>
                  <Text style={[local.variantName, isDark && shared.textDark]}>{v.name}: {v.value}</Text>
                  <Text style={[local.variantMeta, isDark && shared.textMuted]}>
                    +{formatPrice(v.price_modifier)} | Stock: {v.stock_quantity}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteVariant(v)} hitSlop={8}>
                  <MaterialIcons name="delete-outline" size={ms(20)} color="#EF4444" />
                </TouchableOpacity>
              </View>
              {editingVariantId === v.id ? (
                <View style={local.stockEditRow}>
                  <View style={local.stepper}>
                    <TouchableOpacity style={local.circleBtn} onPress={() => handleStockDelta(-1)}>
                      <MaterialIcons name="remove" size={ms(16)} color="#fff" />
                    </TouchableOpacity>
                    <Input value={editStock} onChangeText={setEditStock} keyboardType="numeric" style={local.stockInput} />
                    <TouchableOpacity style={local.circleBtn} onPress={() => handleStockDelta(1)}>
                      <MaterialIcons name="add" size={ms(16)} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <View style={local.stockEditActions}>
                    <Button title={stockSaving ? "..." : "Guardar"} onPress={() => confirmSaveStock(v)} disabled={stockSaving} />
                    <Button title="Cancelar" variant="outline" onPress={() => setEditingVariantId(null)} />
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => { setEditingVariantId(v.id); setEditStock(String(v.stock_quantity)); }} style={local.editStockBtn}>
                  <MaterialIcons name="edit" size={ms(14)} color={isDark ? "#ACD4CD" : "#6B9E98"} />
                  <Text style={local.editStockText}>Editar stock</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {showVariantForm && (
            <View style={[local.variantForm, isDark && local.variantFormDark]}>
              <Text style={[local.formTitle, isDark && shared.textDark]}>Nueva variante</Text>
              <Input label="Nombre (ej: Tamaño)" value={varName} onChangeText={setVarName} placeholder="Tamaño" />
              <Input label="Valor (ej: Grande)" value={varValue} onChangeText={setVarValue} placeholder="Grande" />
              <Input label="Modificador de precio" value={varPrice} onChangeText={setVarPrice} placeholder="5000" keyboardType="numeric" />
              <Input label="Stock inicial" value={varStock} onChangeText={setVarStock} placeholder="10" keyboardType="numeric" />
              <Button title={varSaving ? "Guardando..." : "Agregar variante"} onPress={confirmAddVariant} disabled={varSaving || !varName.trim() || !varValue.trim()} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  content: { padding: s(16), gap: vs(16), paddingBottom: vs(40) },
  imageRow: { flexDirection: "row", alignItems: "center", gap: s(8), backgroundColor: "rgba(0,0,0,0.05)", borderRadius: ms(8), padding: s(10) },
  imageRowDark: { backgroundColor: "rgba(255,255,255,0.05)" },
  imageUrl: { flex: 1, fontSize: ms(11), color: "#687076" },
  primaryBadge: { backgroundColor: "#6B9E98", paddingHorizontal: s(8), paddingVertical: vs(2), borderRadius: ms(8) },
  primaryText: { fontSize: ms(10), color: "#fff", fontWeight: "600" },
  inlineForm: { gap: vs(10) },
  variantCard: { backgroundColor: "rgba(0,0,0,0.04)", borderRadius: ms(10), padding: s(12), gap: vs(8) },
  variantCardDark: { backgroundColor: "rgba(255,255,255,0.06)" },
  variantHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  variantInfo: { flex: 1, gap: vs(2) },
  variantName: { fontSize: ms(13), fontWeight: "600", color: "#000" },
  variantMeta: { fontSize: ms(11), color: "#687076" },
  stockEditRow: { gap: vs(8), marginTop: vs(8), paddingTop: vs(8), borderTopWidth: 1, borderTopColor: "rgba(150,150,150,0.2)" },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: s(16) },
  circleBtn: { width: ms(32), height: ms(32), borderRadius: ms(16), backgroundColor: "#6B9E98", justifyContent: "center", alignItems: "center" },
  stockInput: { flex: 0, minWidth: ms(80), textAlign: "center" },
  stockEditActions: { flexDirection: "row", justifyContent: "flex-end", gap: s(8) },
  editStockBtn: { flexDirection: "row", alignItems: "center", gap: s(4) },
  editStockText: { fontSize: ms(12), color: "#6B9E98", fontWeight: "600" },
  variantForm: { backgroundColor: "rgba(107,158,152,0.08)", borderRadius: ms(12), padding: s(16), gap: vs(12) },
  variantFormDark: { backgroundColor: "rgba(107,158,152,0.12)" },
  formTitle: { fontSize: ms(14), fontWeight: "700", color: "#000" },
});
