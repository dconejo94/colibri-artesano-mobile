import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ms, s } from "@/utils/scale";
import { useTheme, fonts } from "@/src/theme";
import { getStore, updateStore } from "@/api/stores";
import type { Store } from "@/types/store";
import { normalizeError, type ApiError } from "@/src/api/errors";
import ErrorBanner from "@/src/components/ErrorBanner";
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
  const [error, setError] = useState<ApiError | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const fetchStore = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStore(storeId);
      setStore(data);
      setName(data.name);
      setDescription(data.description);
    } catch (err) {
      // GET: no interceptor toast (it only fires for mutations), so here we
      // always want to show the ErrorBanner, transient or not.
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

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
    } catch (err) {
      const apiErr = normalizeError(err);
      const isTransient = apiErr.status === null || apiErr.status >= 500;

      // PATCH: network/5xx errors are already surfaced by the interceptor's
      // global toast (client.ts, only fires for mutations). Also showing the
      // banner here would be a duplicate notice for the same error.
      if (!isTransient) {
        setError(apiErr);
      }
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = store && (name !== store.name || description !== store.description);

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SubHeader title="Editar tienda" onBack={() => router.back()} />

      {loading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && !store ? (
        // Initial load failed: without `store` there's nothing to edit, so
        // there's no point showing the empty/broken form below the banner.
        <ErrorBanner error={error} onRetry={fetchStore} variant="centered" />
      ) : (
        <ScrollView contentContainerStyle={local.content} keyboardShouldPersistTaps="handled">
          <View style={[local.card, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.md }]}>
            <View style={local.iconRow}>
              <MaterialIcons name="storefront" size={ms(40)} color={colors.primary} />
            </View>
            {/* By this point `store` is guaranteed: this is a save error, not a
                load error, so it's compact and without retry. */}
            <ErrorBanner error={error} onDismiss={() => setError(null)} />
            <Input label="Nombre de la tienda" value={name} onChangeText={(t) => { setName(t); setError(null); setSaveMsg(null); }} placeholder="Nombre" />
            <Input label="Descripción" value={description} onChangeText={(t) => { setDescription(t); setError(null); setSaveMsg(null); }} placeholder="Describe tu tienda..." multiline />

            {saveMsg && (
              <View style={local.successRow}>
                <MaterialIcons name="check-circle" size={ms(16)} color={colors.successText} />
                <Text style={[text.label, { color: colors.successText, fontFamily: fonts.sanBold }]}>{saveMsg}</Text>
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