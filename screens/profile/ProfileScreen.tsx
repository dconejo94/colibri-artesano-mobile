import { View, Text, ScrollView, Pressable, Switch, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs, ms } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/auth/authStore";
import { usePreferencesStore } from "@/src/store/preferencesStore";

const ROLE_LABELS: Record<string, string> = {
  buyer: "Comprador",
  vendor: "Vendedor",
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const { colors, radii, text, isDark: resolvedIsDark } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const themeOverride = usePreferencesStore((s) => s.themeOverride);
  const setThemeOverride = usePreferencesStore((s) => s.setThemeOverride);
  const isDarkSwitch = themeOverride === "system" ? resolvedIsDark : themeOverride === "dark";

  const displayName = user?.name?.trim() || user?.email.split("@")[0] || "Usuario";
  const roleLabel = user ? ROLE_LABELS[user.role] ?? user.role : "";

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={local.content}>
        {/* ── Header ── */}
        <View style={local.headerRow}>
          <View style={[local.avatar, { backgroundColor: colors.primary, borderRadius: radii.lg }]}>
            <Text style={[text.h2, { color: colors.textOnPrimary }]}>{getInitials(displayName)}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[text.h2, { color: colors.textPrimary }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[text.caption, { color: colors.textSecondary, marginTop: 2 }]}>{roleLabel}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: s(16) }}>
          <Pressable
            onPress={() => router.push("/perfil/editar" as any)}
            style={[local.editBtn, { borderColor: colors.primary, borderRadius: radii.md }]}
          >
            <MaterialIcons name="edit" size={18} color={colors.primary} />
            <Text style={[text.button, { color: colors.primary, fontSize: 14 }]}>Editar perfil</Text>
          </Pressable>
        </View>

        {/* ── Preferences ── */}
        <Section title="Preferencias" colors={colors} text={text}>
          <Row
            icon="dark-mode"
            label="Modo oscuro"
            colors={colors}
            text={text}
            right={
              <Switch
                value={isDarkSwitch}
                onValueChange={(v) => setThemeOverride(v ? "dark" : "light")}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            }
          />
        </Section>

        {/* ── Support ── */}
        <Section title="Soporte" colors={colors} text={text}>
          <Row
            icon="help-outline"
            label="Centro de ayuda"
            colors={colors}
            text={text}
            onPress={() =>
              Alert.alert(
                "Centro de ayuda",
                "¿Necesitas ayuda? Escríbenos a soporte@colibriartesano.com y te responderemos a la brevedad."
              )
            }
            chevron
          />
          <Row
            icon="description"
            label="Términos y privacidad"
            colors={colors}
            text={text}
            onPress={() =>
              Alert.alert(
                "Términos y privacidad",
                "Colibrí Artesano conecta compradores con artesanos locales. Tus datos personales se usan únicamente para procesar pedidos y mejorar tu experiencia dentro de la app."
              )
            }
            chevron
          />
        </Section>

        <View style={{ padding: s(16), paddingBottom: vs(40) }}>
          <Pressable
            onPress={handleLogout}
            style={[local.logoutBtn, { borderColor: colors.errorText, borderRadius: radii.md }]}
          >
            <MaterialIcons name="logout" size={19} color={colors.errorText} />
            <Text style={[text.button, { color: colors.errorText, fontSize: 15 }]}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  colors,
  text,
  children,
}: {
  title: string;
  colors: ReturnType<typeof useTheme>["colors"];
  text: ReturnType<typeof useTheme>["text"];
  children: React.ReactNode;
}) {
  const { radii } = useTheme();
  return (
    <View style={{ paddingHorizontal: s(16), marginTop: vs(20), gap: vs(9) }}>
      <Text style={[local.sectionLabel, { color: colors.textMuted }]}>{title.toUpperCase()}</Text>
      <View style={{ backgroundColor: colors.bgCard, borderRadius: radii.lg, borderWidth: 0.5, borderColor: colors.border, overflow: "hidden" }}>
        {children}
      </View>
    </View>
  );
}

function Row({
  icon,
  label,
  colors,
  text,
  right,
  onPress,
  chevron,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  colors: ReturnType<typeof useTheme>["colors"];
  text: ReturnType<typeof useTheme>["text"];
  right?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={local.row}>
      <MaterialIcons name={icon} size={20} color={colors.primary} />
      <Text style={[text.body, { color: colors.textPrimary, flex: 1 }]}>{label}</Text>
      {right}
      {chevron && <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  content: { paddingTop: vs(16), paddingBottom: vs(8) },
  headerRow: { flexDirection: "row", alignItems: "center", gap: s(14), paddingHorizontal: s(16) },
  avatar: { width: ms(64), height: ms(64), alignItems: "center", justifyContent: "center", flexShrink: 0 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s(8),
    borderWidth: 1.5,
    paddingVertical: vs(11),
    marginTop: vs(16),
  },
  sectionLabel: { fontSize: ms(11), fontWeight: "500", letterSpacing: 1.1 },
  row: { flexDirection: "row", alignItems: "center", gap: s(13), padding: s(14) },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s(9),
    borderWidth: 1.5,
    paddingVertical: vs(13),
  },
});
