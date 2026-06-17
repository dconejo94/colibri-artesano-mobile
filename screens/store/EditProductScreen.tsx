import { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { formatPrice } from "@/utils/format";
import { useTheme } from "@/src/theme";
import client from "@/api/client";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    { type: "product" } | { type: "variant"; variant: ProductVariant }
  >({ type: "product" });

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
      } catch {
        Alert.alert("Error", "No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSaveProduct = async () => {
    if (!id || !name.trim() || !basePrice.trim()) return;
    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) { setSaveError("Precio inválido."); return; }
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

  const confirmSaveProduct = () => handleSaveProduct();

  const handleDeleteProduct = async () => {
    if (!id) return;
    try {
      await client.delete(`/api/v1/products/${id}`);
      setShowDeleteModal(false);
      router.replace({ pathname: "/store/products" as never, params: { storeId } });
    } catch {
      Alert.alert("Error", "No se pudo eliminar el producto.");
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
    } catch {
      Alert.alert("Error", "No se pudo eliminar la variante.");
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
    } catch {
      Alert.alert("Error", "No se pudo agregar la variante.");
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
    } catch {
      Alert.alert("Error", "No se pudo actualizar el stock.");
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

  const handleAddImage = async () => {
    if (!id || !imageUrl.trim()) return;
    setImageSaving(true);
    try {
      const img = await addProductImage(id, {
        image_url: imageUrl.trim(),
        is_primary: (product?.images?.length ?? 0) === 0,
      });
      setProduct((prev) => prev ? { ...prev, images: [...(prev.images || []), img] } : prev);
      setImageUrl("");
      setShowImageForm(false);
    } catch {
      Alert.alert("Error", "No se pudo agregar la imagen.");
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

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <SubHeader title="Editar producto" onBack={() => router.back()} />

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

          {saveError && (
            <Text style={[text.body, { color: colors.errorText }]}>{saveError}</Text>
          )}
          {saveMsg && (
            <View style={styles.successRow}>
              <MaterialIcons name="check-circle" size={ms(16)} color={colors.successText} />
              <Text style={[text.body, { color: colors.successText, fontWeight: "600" }]}>{saveMsg}</Text>
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
            <Text style={[text.label, { color: colors.errorText, fontWeight: "700" }]}>Eliminar producto</Text>
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

          {(product?.images?.length ?? 0) === 0 && !showImageForm && (
            <Text style={[text.body, local.emptyText, { color: colors.textSecondary }]}>Sin imágenes</Text>
          )}

          {(product?.images ?? []).map((img) => (
            <View key={img.id} style={[local.imageRow, { backgroundColor: colors.bgSection }]}>
              <MaterialIcons name="image" size={ms(20)} color={colors.primary} />
              <Text style={[local.imageUrl, { color: colors.textSecondary }]} numberOfLines={1}>{img.image_url}</Text>
              {img.is_primary && (
                <View style={[local.primaryBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[local.primaryText, { color: colors.textOnPrimary }]}>Principal</Text>
                </View>
              )}
            </View>
          ))}

          {showImageForm && (
            <View style={local.inlineForm}>
              <Input label="URL de imagen" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />
              <Button
                title={imageSaving ? "Agregando..." : "Agregar imagen"}
                onPress={handleAddImage}
                disabled={imageSaving || !imageUrl.trim()}
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
                  <Text style={[local.variantName, { color: colors.textPrimary }]} numberOfLines={2}>
                    {v.name}: {v.value}
                  </Text>
                  <Text style={[local.variantMeta, { color: colors.textSecondary }]} numberOfLines={2}>
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
                  <Text style={[local.editStockText, { color: colors.primary }]}>Editar stock</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Formulario nueva variante — sin Alert intermedio */}
          {showVariantForm && (
            <View style={[local.variantForm, { backgroundColor: colors.bgSection }]}>
              <Text style={[local.formTitle, { color: colors.textPrimary }]}>Nueva variante</Text>
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
                <Text style={[text.label, { color: colors.textPrimary, fontWeight: "700" }]}>Cancelar</Text>
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
                <Text style={[text.label, { color: colors.errorText, fontWeight: "700" }]}>Eliminar</Text>
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