import { useState, useEffect, useCallback } from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { s, vs } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { getEvent, createEvent, updateEvent } from "@/api/events";
import { normalizeError, type ApiError } from "@/src/api/errors";
import { useLocation } from "@/src/hooks/useLocation";
import ErrorBanner from "@/src/components/ErrorBanner";
import SubHeader from "@/components/ui/SubHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// Costa Rica doesn't observe DST, so a fixed -06:00 offset is always correct
// for combining the plain date/time inputs into the AwareDatetime the
// backend requires.
const CR_OFFSET = "-06:00";

function splitDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  // Format in the Costa Rica offset regardless of device timezone.
  const shifted = new Date(d.getTime() - 6 * 60 * 60 * 1000);
  const date = shifted.toISOString().slice(0, 10);
  const time = shifted.toISOString().slice(11, 16);
  return { date, time };
}

export default function EventFormScreen() {
  const { colors, text, radii, spacing } = useTheme();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const isNew = eventId === "nuevo";
  // autoRequest: false — don't pop the OS location dialog just from opening
  // this form; only ask when the admin taps "Usar mi ubicación actual".
  const { coords: deviceCoords, isLoading: locLoading, requestPermission } = useLocation(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchEvent = useCallback(async () => {
    if (isNew || !eventId) return;
    setLoading(true);
    setError(null);
    try {
      const event = await getEvent(eventId);
      setTitle(event.title);
      setDescription(event.description ?? "");
      setLocation(event.location ?? "");
      setCoverImageUrl(event.cover_image_url ?? "");
      // Legacy events may not have coordinates backfilled yet even though
      // the type claims non-null — fall back to an empty (invalid) field
      // rather than showing the literal string "null".
      setLatitude(event.latitude != null ? String(event.latitude) : "");
      setLongitude(event.longitude != null ? String(event.longitude) : "");
      const { date: d, time: t } = splitDateTime(event.event_date);
      setDate(d);
      setTime(t);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, [isNew, eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleUseCurrentLocation = async () => {
    if (deviceCoords) {
      setLatitude(String(deviceCoords.latitude));
      setLongitude(String(deviceCoords.longitude));
      return;
    }
    const result = await requestPermission();
    if (result) {
      setLatitude(String(result.latitude));
      setLongitude(String(result.longitude));
    }
  };

  const isValidLat = /^-?\d{1,2}(\.\d+)?$/.test(latitude.trim()) && Math.abs(Number(latitude)) <= 90;
  const isValidLng = /^-?\d{1,3}(\.\d+)?$/.test(longitude.trim()) && Math.abs(Number(longitude)) <= 180;

  const isValid =
    title.trim() &&
    /^\d{4}-\d{2}-\d{2}$/.test(date.trim()) &&
    /^\d{2}:\d{2}$/.test(time.trim()) &&
    isValidLat &&
    isValidLng;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        event_date: `${date.trim()}T${time.trim()}:00${CR_OFFSET}`,
        cover_image_url: coverImageUrl.trim() || null,
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
      if (isNew) {
        await createEvent(payload);
      } else if (eventId) {
        await updateEvent(eventId, payload);
      }
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
      <SubHeader title={isNew ? "Crear evento" : "Editar evento"} onBack={() => router.back()} />

      {loading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && !title && !isNew ? (
        <ErrorBanner error={error} onRetry={fetchEvent} variant="centered" />
      ) : (
        <ScrollView contentContainerStyle={local.content} keyboardShouldPersistTaps="handled">
          <ErrorBanner error={error} onDismiss={() => setError(null)} />
          <Input label="Título" value={title} onChangeText={setTitle} placeholder="Ej: Feria de Guadalupe" />
          <Input label="Descripción" value={description} onChangeText={setDescription} placeholder="Describe el evento..." multiline />
          <Input label="Fecha (AAAA-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-08-15" />
          <Input label="Hora (HH:MM, 24h)" value={time} onChangeText={setTime} placeholder="18:00" />
          <Input label="Lugar" value={location} onChangeText={setLocation} placeholder="Ej: Parque Central, Guadalupe" />

          <View style={{ gap: vs(8) }}>
            <View style={local.coordsRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Latitud"
                  value={latitude}
                  onChangeText={setLatitude}
                  placeholder="9.9281"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Longitud"
                  value={longitude}
                  onChangeText={setLongitude}
                  placeholder="-84.0907"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>
            <Pressable
              onPress={handleUseCurrentLocation}
              disabled={locLoading}
              style={[local.locationBtn, { borderColor: colors.primary, borderRadius: radii.md }]}
            >
              <MaterialIcons name="my-location" size={16} color={colors.primary} />
              <Text style={[text.caption, { color: colors.primary, fontWeight: "700", marginLeft: 6 }]}>
                {locLoading ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
              </Text>
            </Pressable>
          </View>

          <Input label="URL de imagen de portada (opcional)" value={coverImageUrl} onChangeText={setCoverImageUrl} placeholder="https://..." />

          <Button title={saving ? "Guardando..." : isNew ? "Crear evento" : "Guardar cambios"} onPress={handleSave} disabled={saving || !isValid} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: s(16), gap: vs(16) },
  coordsRow: { flexDirection: "row", gap: s(12) },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    paddingVertical: vs(10),
    alignSelf: "flex-start",
    paddingHorizontal: s(14),
  },
});
