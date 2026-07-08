import { useState, useEffect, useCallback } from "react";
import { useWindowDimensions } from "react-native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { formatPrice } from "@/utils/format";
import { useTheme, fonts } from "@/src/theme";
import client from "@/api/client";
import * as ImagePicker from "expo-image-picker";
import {
  getProduct,
  updateProduct,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  addProductImage,
  getUploadUrl,
  uploadImageToBlob,
} from "@/api/products";
import { getCategories } from "@/api/categories";
import type { Product, ProductVariant, Category } from "@/types/store";
import { normalizeError, type ApiError } from "@/src/api/errors";
import ErrorBanner from "@/src/components/ErrorBanner";
import SubHeader from "@/components/ui/SubHeader";
import CategoryPicker from "@/components/ui/CategoryPicker";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// Red/5xx en mutaciones ya los avisa el toast global del interceptor
// (client.ts). Mostrar además un Alert/ErrorBanner con el mismo mensaje
// sería un aviso duplicado, así que estos handlers lo filtran acá.
const isTransientError = (err: ApiError) => err.status === null || err.status >= 500;

export default function EditProductScreen() {
  const { colors, radii, shadows, spacing, text } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
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
  const [saveError, setSaveError] = useState<ApiError | null>(null);
  const [loadError, setLoadError] = useState<ApiError | null>(null);

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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [imageSaving, setImageSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    { type: "product" } | { type: "variant"; variant: ProductVariant }
  >({ type: "product" });

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
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
    } catch (err) {
      setLoadError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveProduct = async () => {
    if (!id || !name.trim() || !basePrice.trim()) return;
    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) {
      setSaveError({ status: 422, message: "Precio inválido." });
      return;
    }
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
    } catch (err) {
      const apiErr = normalizeError(err);
      if (!isTransientError(apiErr)) {
        setSaveError(apiErr);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmSaveProduct = () => handleSaveProduct();

  const handleDeleteProduct = async () => {
    if (!id) return;
    try {
      await client.delete(`/api/v1/products/${id}`);
      setShowDeleteModal(false);
      router.replace({ pathname: "/store/products" as never, params: { storeId } });
    } catch (err) {
      const apiErr = normalizeError(err);
      if (!isTransientError(apiErr)) {
        Alert.alert("Error", apiErr.message);
      }
    }
  };

  const confirmDeleteProduct = () => {
    setDeleteTarget({ type: "product" });
    setShowDeleteModal(true);
  };

  const handleDeleteVariantConfirmed = async (variant: ProductVariant) => {
    if (!id) return;
    try {
      await deleteProductVariant(id, variant.id);
      setProduct((prev) => prev ? {
        ...prev,
        variants: (prev.variants || []).filter((v) => v.id !== variant.id),
      } : prev);
      setShowDeleteModal(false);
    } catch (err) {
      const apiErr = normalizeError(err);
      if (!isTransientError(apiErr)) {
        Alert.alert("Error", apiErr.message);
      }
    }
  };

  const confirmDeleteVariant = (variant: ProductVariant) => {
    setDeleteTarget({ type: "variant", variant });
    setShowDeleteModal(true);
  };

  // ── Variants ────────────────────────────────────────────────────────────────

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
    } catch (err) {
      const apiErr = normalizeError(err);
      if (!isTransientError(apiErr)) {
        Alert.alert("Error", apiErr.message);
      }
    } finally {
      setVarSaving(false);
    }
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
    } catch (err) {
      const apiErr = normalizeError(err);
      if (!isTransientError(apiErr)) {
        Alert.alert("Error", apiErr.message);
      }
    } finally {
      setStockSaving(false);
    }
  };

  const confirmSaveStock = (variant: ProductVariant) => handleUpdateStock(variant);

  const handleStockDelta = (delta: number) => {
    const current = parseInt(editStock, 10) || 0;
    setEditStock(String(Math.max(0, current + delta)));
  };

  // ── Images ──────────────────────────────────────────────────────────────────

  const handlePickAndUploadImage = async () => {
    if (!id) return;
    const variants = product?.variants || [];
    const targetVariantId = selectedVariantId || (variants.length === 1 ? variants[0].id : null);
    
    if (!targetVariantId) {
      Alert.alert("Aviso", "Selecciona una variante primero.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      setImageSaving(true);
      const asset = result.assets[0];
      const uri = asset.uri;
      const filename = uri.split("/").pop() || "image.jpg";
      const contentType = filename.endsWith(".png") ? "image/png" : "image/jpeg";

      // 1. Get SAS URL
      const { upload_url, blob_url } = await getUploadUrl(id, targetVariantId, filename, contentType);
      
      // 2. Upload blob
      await uploadImageToBlob(upload_url, uri, contentType);

      // 3. Register image in DB
      const targetVariant = variants.find(v => v.id === targetVariantId);
      const isPrimary = (targetVariant?.images?.length ?? 0) === 0;

      const img = await addProductImage(id, targetVariantId, {
        image_url: blob_url,
        is_primary: isPrimary,
      });

      // Update state
      setProduct((prev) => {
        if (!prev) return prev;
        const newVariants = (prev.variants || []).map((v) => {
          if (v.id === targetVariantId) {
            return { ...v, images: [...(v.images || []), img] };
          }
          return v;
        });
        return { ...prev, variants: newVariants };
      });

      setShowImageForm(false);
    } catch (err) {
      const apiErr = normalizeError(err);
      if (!isTransientError(apiErr)) {
        Alert.alert("Error", apiErr.message);
      }
    } finally {
      setImageSaving(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Load error state ─────────────────────────────────────────────────────────
  // Si falló la carga, el producto (y las categorías) no están disponibles, así
  // que no tiene sentido mostrar el formulario de edición vacío/roto debajo.

  if (loadError || !product) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <SubHeader title="Editar Producto" onBack={() => router.back()} />
        <ErrorBanner
          error={loadError ?? { status: 0, message: "No se pudo cargar el producto." }}
          onRetry={fetchData}
          variant="centered"
        />
      </SafeAreaView>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SubHeader title="Editar Producto" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={local.content} keyboardShouldPersistTaps="handled">

        {/* ── Información del producto ── */}
        <View style={[styles.section, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg, ...shadows.sm }]}>
          <Text style={[text.h3, { color: colors.primaryDeep }]}>Información del producto</Text>

          <Input
            label="Nombre"
            value={name}
            onChangeText={(t) => { setName(t); setSaveMsg(null); setSaveError(null); }}
            placeholder="Nombre"
          />
          <Input
            label="Descripción"
            value={description}
            onChangeText={(t) => { setDescription(t); setSaveMsg(null); }}
            placeholder="Descripción"
            multiline
          />
          <Input
            label="Precio base"
            value={basePrice}
            onChangeText={(t) => { setBasePrice(t); setSaveMsg(null); setSaveError(null); }}
            placeholder="₡25.000"
            keyboardType="numeric"
          />

          {categories.length > 0 && (
            <CategoryPicker
              categories={categories}
              selectedId={categoryId}
              onSelect={(id) => { setCategoryId(id); setSaveMsg(null); }}
            />
          )}

          <ErrorBanner error={saveError} onDismiss={() => setSaveError(null)} />
          {saveMsg && (
            <View style={styles.successRow}>
              <MaterialIcons name="check-circle" size={ms(16)} color={colors.successText} />
              <Text style={[text.label, { color: colors.successText, fontFamily: fonts.sanBold }]}>{saveMsg}</Text>
            </View>
          )}

          <Button
            title={saving ? "Guardando..." : "Guardar cambios"}
            onPress={confirmSaveProduct}
            disabled={saving || !name.trim()}
          />
          <TouchableOpacity
            onPress={confirmDeleteProduct}
            style={[local.deleteProductBtn, { borderColor: colors.errorText, backgroundColor: colors.bgSection }]}
            activeOpacity={0.85}
          >
            <MaterialIcons name="delete-outline" size={ms(18)} color={colors.errorText} />
            <Text style={[text.button, { color: colors.errorText }]}>Eliminar producto</Text>
          </TouchableOpacity>
        </View>

        {/* ── Imágenes ── */}
        <View style={[styles.section, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg, ...shadows.sm }]}>
          <View style={local.sectionHeader}>
            <Text style={[text.h3, { color: colors.primaryDeep }]}>Imágenes</Text>
            <TouchableOpacity onPress={() => setShowImageForm(!showImageForm)} hitSlop={8}>
              <MaterialIcons name={showImageForm ? "close" : "add-circle"} size={ms(24)} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {((product?.variants ?? []).flatMap(v => v.images || []).length) === 0 && !showImageForm && (
            <Text style={[text.body, local.emptyText, { color: colors.textSecondary }]}>Sin imágenes</Text>
          )}

          {(product?.variants ?? []).map((v) => 
            (v.images ?? []).map((img) => (
              <View key={img.id} style={[local.imageRow, { backgroundColor: colors.bgSection }]}>
                <MaterialIcons name="image" size={ms(20)} color={colors.primary} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[local.imageUrl, { color: colors.textSecondary }]} numberOfLines={1}>{img.image_url}</Text>
                  <Text style={[text.caption, { color: colors.textMuted, fontSize: ms(10) }]}>Variante: {v.name} - {v.value}</Text>
                </View>
                {img.is_primary && (
                  <View style={[local.primaryBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[local.primaryText, { color: colors.textOnPrimary }]}>Principal</Text>
                  </View>
                )}
              </View>
            ))
          )}

          {showImageForm && (
            <View style={local.inlineForm}>
              {(product?.variants?.length ?? 0) > 1 && (
                <View style={{ marginBottom: vs(8) }}>
                  <Text style={[text.label, { color: colors.textPrimary, marginBottom: vs(4) }]}>Selecciona variante:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: s(8) }}>
                    {(product?.variants ?? []).map((v) => (
                      <TouchableOpacity
                        key={v.id}
                        style={{
                          paddingHorizontal: s(12),
                          paddingVertical: vs(6),
                          borderRadius: radii.md,
                          borderWidth: 1,
                          borderColor: selectedVariantId === v.id ? colors.primary : colors.border,
                          backgroundColor: selectedVariantId === v.id ? colors.primarySoft : colors.bgSection,
                        }}
                        onPress={() => setSelectedVariantId(v.id)}
                      >
                        <Text style={[text.caption, { color: selectedVariantId === v.id ? colors.primaryDeep : colors.textPrimary }]}>
                          {v.name}: {v.value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              <Button
                title={imageSaving ? "Subiendo..." : "Seleccionar y subir imagen"}
                onPress={handlePickAndUploadImage}
                disabled={imageSaving || ((product?.variants?.length ?? 0) > 1 && !selectedVariantId)}
              />
            </View>
          )}
        </View>

        {/* ── Variantes y stock ── */}
        <View style={[styles.section, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg, ...shadows.sm }]}>
          <View style={local.sectionHeader}>
            <Text style={[text.h3, { color: colors.primaryDeep }]}>Variantes y stock</Text>
            <TouchableOpacity onPress={() => setShowVariantForm(!showVariantForm)} hitSlop={8}>
              <MaterialIcons name={showVariantForm ? "close" : "add-circle"} size={ms(24)} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={[text.caption, { color: colors.textSecondary }]}>
            Gestiona cada variante y su inventario.
          </Text>

          {(product?.variants?.length ?? 0) === 0 && !showVariantForm && (
            <Text style={[text.body, local.emptyText, { color: colors.textSecondary }]}>Sin variantes</Text>
          )}

          {(product?.variants ?? []).map((v) => (
            <View key={v.id} style={[local.variantCard, { backgroundColor: colors.bgSection }]}>
              <View style={[local.variantHeader, isCompact && local.variantHeaderCompact]}>
                <View style={local.variantInfo}>
                  <Text style={[text.label, { color: colors.textPrimary, fontFamily: fonts.sanBold }]} numberOfLines={2}>
                    {v.name}: {v.value}
                  </Text>
                  <Text style={[text.caption, { color: colors.textSecondary }]} numberOfLines={2}>
                    +{formatPrice(v.price_modifier)} | Stock: {v.stock_quantity}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => confirmDeleteVariant(v)} hitSlop={8}>
                  <MaterialIcons name="delete-outline" size={ms(20)} color={colors.errorText} />
                </TouchableOpacity>
              </View>

              {editingVariantId === v.id ? (
                <View style={[local.stockEditRow, { borderTopColor: colors.border }, isCompact && local.stockEditRowCompact]}>
                  <View style={[local.stepper, isCompact && local.stepperCompact]}>
                    <TouchableOpacity
                      style={[local.circleBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleStockDelta(-1)}
                    >
                      <MaterialIcons name="remove" size={ms(16)} color={colors.textOnPrimary} />
                    </TouchableOpacity>
                    <Input
                      value={editStock}
                      onChangeText={setEditStock}
                      keyboardType="numeric"
                      style={local.stockInput}
                    />
                    <TouchableOpacity
                      style={[local.circleBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleStockDelta(1)}
                    >
                      <MaterialIcons name="add" size={ms(16)} color={colors.textOnPrimary} />
                    </TouchableOpacity>
                  </View>
                  <View style={[local.stockEditActions, isCompact && local.stockEditActionsCompact]}>
                    <Button
                      title={stockSaving ? "..." : "Guardar"}
                      onPress={() => confirmSaveStock(v)}
                      disabled={stockSaving}
                    />
                    <Button title="Cancelar" variant="ghost" onPress={() => setEditingVariantId(null)} />
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => { setEditingVariantId(v.id); setEditStock(String(v.stock_quantity)); }}
                  style={local.editStockBtn}
                >
                  <MaterialIcons name="edit" size={ms(14)} color={colors.primary} />
                  <Text style={[text.label, { color: colors.primary }]}>Editar stock</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Formulario nueva variante — sin Alert intermedio */}
          {showVariantForm && (
            <View style={[local.variantForm, { backgroundColor: colors.bgSection }]}>
              <Text style={[text.label, { color: colors.textPrimary, fontFamily: fonts.sanBold }]}>Nueva variante</Text>
              <Input label="Nombre (ej: Tamaño)" value={varName} onChangeText={setVarName} placeholder="Tamaño" />
              <Input label="Valor (ej: Grande)" value={varValue} onChangeText={setVarValue} placeholder="Grande" />
              <Input
                label="Modificador de precio"
                value={varPrice}
                onChangeText={setVarPrice}
                placeholder="₡5.000"
                keyboardType="numeric"
              />
              <Input
                label="Stock inicial"
                value={varStock}
                onChangeText={setVarStock}
                placeholder="10"
                keyboardType="numeric"
              />
              <Button
                title={varSaving ? "Guardando..." : "Agregar variante"}
                onPress={handleAddVariant}
                disabled={varSaving || !varName.trim() || !varValue.trim()}
              />
            </View>
          )}
        </View>

      </ScrollView>

      {/* ── Modal de confirmación de eliminación ── */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.bgCard, borderColor: colors.border, ...shadows.sm }]}>
            <View style={[styles.modalIcon, { backgroundColor: colors.errorBg }]}>
              <MaterialIcons name="delete-outline" size={ms(24)} color={colors.errorText} />
            </View>
            <Text style={[text.h3, { color: colors.primaryDeep, textAlign: "center" }]}>
              Eliminar {deleteTarget.type === "product" ? "producto" : "variante"}
            </Text>
            <Text style={[text.body, { color: colors.textSecondary, textAlign: "center" }]}>
              {deleteTarget.type === "product"
                ? "Esta acción eliminará el producto y todas sus variantes. No se puede deshacer."
                : `Eliminarás la variante "${deleteTarget.variant.name}: ${deleteTarget.variant.value}". No se puede deshacer.`}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={[styles.modalBtn, { backgroundColor: colors.bgSection, borderColor: colors.border }]}
                activeOpacity={0.85}
              >
                <Text style={[text.button, { color: colors.textPrimary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (deleteTarget.type === "product") {
                    void handleDeleteProduct();
                  } else {
                    void handleDeleteVariantConfirmed(deleteTarget.variant);
                  }
                }}
                style={[styles.modalBtn, { backgroundColor: colors.errorBg, borderColor: colors.errorText }]}
                activeOpacity={0.85}
              >
                <Text style={[text.button, { color: colors.errorText }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: { padding: s(16), gap: vs(12), borderWidth: 0.5 },
  successRow: { flexDirection: "row", alignItems: "center", gap: s(6) },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: s(24),
  },
  modalCard: {
    width: "100%",
    maxWidth: ms(340),
    borderWidth: 0.5,
    borderRadius: ms(20),
    padding: s(20),
    gap: vs(14),
  },
  modalIcon: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(18),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  modalActions: { flexDirection: "row", gap: s(10) },
  modalBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: ms(12),
    paddingVertical: vs(12),
    alignItems: "center",
    justifyContent: "center",
  },
});

const local = StyleSheet.create({
  content: { padding: s(16), gap: vs(16), paddingBottom: vs(40) },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  emptyText: { textAlign: "center" },
  imageRow: { flexDirection: "row", alignItems: "center", gap: s(8), borderRadius: ms(8), padding: s(10) },
  imageUrl: { flex: 1, fontSize: ms(11) },
  primaryBadge: { paddingHorizontal: s(8), paddingVertical: vs(2), borderRadius: ms(8) },
  primaryText: { fontSize: ms(10), fontWeight: "600" },
  inlineForm: { gap: vs(10) },
  variantCard: { borderRadius: ms(10), padding: s(12), gap: vs(8) },
  variantHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: s(10) },
  variantHeaderCompact: { flexWrap: "wrap" },
  variantInfo: { flex: 1, gap: vs(2) },
  variantName: { fontSize: ms(13), fontWeight: "600" },
  variantMeta: { fontSize: ms(11) },
  stockEditRow: { gap: vs(8), marginTop: vs(8), paddingTop: vs(8), borderTopWidth: 1 },
  stockEditRowCompact: { alignItems: "stretch" },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: s(16) },
  stepperCompact: { width: "100%", justifyContent: "space-between", gap: s(10) },
  circleBtn: { width: ms(32), height: ms(32), borderRadius: ms(16), justifyContent: "center", alignItems: "center" },
  stockInput: { flex: 0, minWidth: ms(72) },
  stockEditActions: { flexDirection: "row", justifyContent: "flex-end", gap: s(8), flexWrap: "wrap" },
  stockEditActionsCompact: { flexDirection: "column", alignItems: "stretch" },
  editStockBtn: { flexDirection: "row", alignItems: "center", gap: s(4) },
  editStockText: { fontSize: ms(12), fontWeight: "600" },
  variantForm: { borderRadius: ms(12), padding: s(16), gap: vs(12) },
  formTitle: { fontSize: ms(14), fontWeight: "700" },
  deleteProductBtn: {
    marginTop: vs(2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s(8),
    borderWidth: 1,
    borderRadius: ms(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(16),
  },
});