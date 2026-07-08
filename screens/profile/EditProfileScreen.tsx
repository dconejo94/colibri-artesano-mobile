import { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, ms } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/auth/authStore";
import { updateMe } from "@/api/users";
import { normalizeError, type ApiError } from "@/src/api/errors";
import ErrorBanner from "@/src/components/ErrorBanner";
import SubHeader from "@/components/ui/SubHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function EditProfileScreen() {
  const { colors, radii, shadows } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateMe({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        bio: bio.trim(),
      });
      setUser(updated);
      router.back();
    } catch (err) {
      const apiErr = normalizeError(err);
      const isTransient = apiErr.status === null || apiErr.status >= 500;
      if (!isTransient) setError(apiErr);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SubHeader title="Información personal" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={local.content} keyboardShouldPersistTaps="handled">
        <View style={[local.card, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, ...shadows.md }]}>
          <View style={local.iconRow}>
            <View style={[local.avatar, { backgroundColor: colors.primary, borderRadius: radii.full }]}>
              <MaterialIcons name="person" size={ms(32)} color={colors.textOnPrimary} />
            </View>
          </View>

          <ErrorBanner error={error} onDismiss={() => setError(null)} />

          <Input label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" />
          <Input label="Teléfono" value={phone} onChangeText={setPhone} placeholder="Ej: 8888-8888" keyboardType="phone-pad" />
          <Input label="Dirección" value={address} onChangeText={setAddress} placeholder="Dirección de entrega" multiline />
          <Input label="Biografía" value={bio} onChangeText={setBio} placeholder="Contales algo sobre ti..." multiline />

          <Button title={saving ? "Guardando..." : "Guardar cambios"} onPress={handleSave} disabled={saving} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  content: { padding: s(16) },
  card: { padding: s(20), gap: s(16), borderWidth: 0.5 },
  iconRow: { alignItems: "center" },
  avatar: { width: ms(72), height: ms(72), alignItems: "center", justifyContent: "center" },
});
