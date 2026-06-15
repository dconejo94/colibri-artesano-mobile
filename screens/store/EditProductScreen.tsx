import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ms, s } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { getStore, updateStore } from "@/api/stores";
import type { Store } from "@/types/store";
import SubHeader from "@/components/ui/SubHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function EditStoreScreen() {
  const { colors, spacing, radii, shadows, text } = useTheme();
  const router = useRouter();
  const { storeId } = useLocalSearchParams<{ storeId: string }>();

  const [store, setStore] = useState<Store | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getStore(storeId);
        setStore(data);
        setName(data.name);
        setDescription(data.description);
      } catch {
        setError("No se pudo cargar la tienda.");
      } finally {
        setLoading(false);
      }
    })();
  }, [storeId]);

  const handleSave = async () => {
    if (!storeId || !name.trim()) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateStore(storeId, {
        name: name.trim(),
        description: description.trim(),
      });
      setStore(updated);
      setSuccess(true);
    } catch {
      setError("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const confirmSave = () => {
    Alert.alert(
      "Confirmar cambios",
      "¿Deseas guardar los cambios de la tienda?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Guardar", onPress: handleSave },
      ]
    );
  };

  const hasChanges = store && (name !== store.name || description !== store.description);

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <SubHeader title="Editar tienda" onBack={() => router.back()} />

      {loading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={local.content} keyboardShouldPersistTaps="handled">
          <View style={[local.card, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.md }]}>
            <View style={local.iconRow}>
              <MaterialIcons name="storefront" size={ms(40)} color={colors.primary} />
            </View>
            <Input label="Nombre de la tienda" value={name} onChangeText={(t) => { setName(t); setSuccess(false); }} placeholder="Nombre" />
            <Input label="Descripción" value={description} onChangeText={(t) => { setDescription(t); setSuccess(false); }} placeholder="Describe tu tienda..." multiline />

            {error && <Text style={[text.body, { color: colors.errorText }]}>{error}</Text>}
            {success && (
              <View style={local.successRow}>
                <MaterialIcons name="check-circle" size={ms(16)} color={colors.successText} />
                <Text style={[text.body, { color: colors.successText, fontWeight: "600" }]}>Cambios guardados</Text>
              </View>
            )}

            <Button title={saving ? "Guardando..." : "Guardar cambios"} onPress={confirmSave} disabled={saving || !hasChanges || !name.trim()} />
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
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { padding: 20, gap: 16, borderWidth: 0.5 },
  iconRow: { alignItems: "center" },
  successRow: { flexDirection: "row", alignItems: "center", gap: 6 },
});
