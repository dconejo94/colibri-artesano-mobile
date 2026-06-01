import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ms } from "@/utils/scale";
import shared from "@/constants/shared-styles";
import { getStore, updateStore } from "@/api/stores";
import type { Store } from "@/types/store";
import SubHeader from "@/components/ui/SubHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function EditStoreScreen() {
  const isDark = useColorScheme() === "dark";
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

  const hasChanges = store && (name !== store.name || description !== store.description);

  return (
    <SafeAreaView edges={["top"]} style={[shared.wrapper, isDark && shared.wrapperDark]}>
      <SubHeader title="Editar tienda" onBack={() => router.back()} />

      {loading ? (
        <View style={shared.centered}>
          <ActivityIndicator size="large" color={isDark ? "#82A8AC" : "#6B9E98"} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={local.content} keyboardShouldPersistTaps="handled">
          <View style={[shared.card, isDark && shared.cardDark]}>
            <View style={local.iconRow}>
              <MaterialIcons name="storefront" size={ms(40)} color={isDark ? "#ACD4CD" : "#6B9E98"} />
            </View>
            <Input label="Nombre de la tienda" value={name} onChangeText={(t) => { setName(t); setSuccess(false); }} placeholder="Nombre" />
            <Input label="Descripcion" value={description} onChangeText={(t) => { setDescription(t); setSuccess(false); }} placeholder="Describe tu tienda..." multiline />

            {error && <Text style={shared.errorText}>{error}</Text>}
            {success && (
              <View style={shared.successRow}>
                <MaterialIcons name="check-circle" size={ms(16)} color="#10B981" />
                <Text style={shared.successText}>Cambios guardados</Text>
              </View>
            )}

            <Button title={saving ? "Guardando..." : "Guardar cambios"} onPress={handleSave} disabled={saving || !hasChanges || !name.trim()} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  content: { padding: 16 },
  iconRow: { alignItems: "center" },
});
