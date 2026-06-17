import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
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
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

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
    setSaveMsg(null);
    try {
      const updated = await updateStore(storeId, {
        name: name.trim(),
        description: description.trim(),
      });
      setStore(updated);
      setSaveMsg("Cambios guardados correctamente.");
    } catch {
      setError("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
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
            <Input label="Nombre de la tienda" value={name} onChangeText={(t) => { setName(t); setError(null); setSaveMsg(null); }} placeholder="Nombre" />
            <Input label="Descripción" value={description} onChangeText={(t) => { setDescription(t); setError(null); setSaveMsg(null); }} placeholder="Describe tu tienda..." multiline />

            {error && <Text style={[text.body, { color: colors.errorText }]}>{error}</Text>}
            {saveMsg && (
              <View style={local.successRow}>
                <MaterialIcons name="check-circle" size={ms(16)} color={colors.successText} />
                <Text style={[text.body, { color: colors.successText, fontWeight: "600" }]}>{saveMsg}</Text>
              </View>
            )}

            <Button title={saving ? "Guardando..." : "Guardar cambios"} onPress={handleSave} disabled={saving || !hasChanges || !name.trim()} />
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
  content: { padding: s(16) },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { padding: s(20), gap: s(16), borderWidth: 0.5 },
  iconRow: { alignItems: "center" },
  successRow: { flexDirection: "row", alignItems: "center", gap: s(6) },
});