import { useState, useCallback, useEffect  } from "react";
import {
  View,
  Text,
  Pressable,
  Linking,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { s, vs, ms } from "@/utils/scale";
import { useTheme } from "@/src/theme";
import { useLocation } from "@/src/hooks/useLocation";
import { useNearbyEvents } from "@/src/hooks/useGetNearbyEvents";
import { formatEventDateLong } from "@/src/components/EventCard";
import ErrorBanner from "@/src/components/ErrorBanner";
import type { EventItem } from "@/types/event";

const SHEET_HEIGHT = vs(240);
const FALLBACK_REGION: Region = {
  latitude: 9.9281,
  longitude: -84.0907,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export default function MapScreen() {
  const { colors, radii, text, spacing, shadows } = useTheme();
  const router = useRouter();
  const { coords, permissionStatus, isLoading: locLoading, error: locError, requestPermission } = useLocation();
  const { events, isLoading: eventsLoading, error: eventsError, refetch } = useNearbyEvents(coords);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [dismissedNetworkError, setDismissedNetworkError] = useState(false);

  const translateY = useSharedValue(SHEET_HEIGHT);

  useEffect(() => {
    if (locLoading) return;
    const timeout = setTimeout(() => {
      if (!mapReady) setMapFailed(true);
    }, 8000);
    return () => clearTimeout(timeout);
  }, [locLoading, mapReady]);

  const openSheet = useCallback((event: EventItem) => {
    setSelectedEvent(event);
    translateY.value = withTiming(0, { duration: 220 });
  }, [translateY]);

  const closeSheet = useCallback(() => {
    translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 });
    setTimeout(() => setSelectedEvent(null), 200);
  }, [translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleComoLlegar = (event: EventItem) => {
    const { latitude, longitude } = event;
    const label = encodeURIComponent(event.title);
    const url = Platform.select({
      ios: `maps://?daddr=${latitude},${longitude}&q=${label}`,
      android: `google.navigation:q=${latitude},${longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    })!;

    Linking.openURL(url).catch(() => {
      const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(fallbackUrl).catch(() => {});
    });
  };

  const permissionDenied =
    permissionStatus !== null && permissionStatus !== "granted" && !locLoading;

  if (mapFailed) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorBanner
        error={{ status: null, message: "No pudimos cargar el mapa en este momento. Intenta de nuevo más tarde." }}
        variant="centered"
      />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[local.header, { paddingHorizontal: spacing[4], paddingVertical: vs(10) }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Volver">
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[text.h3, { color: colors.textPrimary, marginLeft: spacing[3] }]}>Mapa</Text>
      </View>

      {locLoading ? (
        <View style={local.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFillObject}
              initialRegion={
                coords
                  ? { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.15, longitudeDelta: 0.15 }
                  : FALLBACK_REGION
              }
              showsUserLocation={!!coords}
              onMapReady={() => setMapReady(true)}
            >
              {events.map((event) => (
                <Marker
                  key={event.id}
                  coordinate={{ latitude: event.latitude, longitude: event.longitude }}
                  onPress={() => openSheet(event)}
                >
                  <View style={[local.pin, { backgroundColor: colors.primary, borderRadius: radii.full }, shadows.sm]}>
                    <MaterialIcons name="storefront" size={16} color={colors.textOnPrimary} />
                  </View>
                </Marker>
              ))}
            </MapView>
          </Pressable>

          {eventsError && (
            <View style={[local.topBanner, { top: spacing[2] }]}>
              <ErrorBanner error={eventsError} onRetry={refetch} />
            </View>
          )}

          {locError && !eventsError && !dismissedNetworkError && (
            <View style={[local.topBanner, { top: spacing[2] }]}>
                <ErrorBanner
                    error={{ status: null, message: locError }}
                    onRetry={requestPermission}
                />
            </View>
          )}

          {permissionDenied && (
            <View
              style={[
                local.permissionCard,
                { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border, padding: spacing[5] },
                shadows.md,
              ]}
            >
              <MaterialIcons name="location-off" size={ms(28)} color={colors.primary} />
              <Text style={[text.body, { color: colors.textPrimary, textAlign: "center", marginTop: vs(8), fontWeight: "700" }]}>
                Necesitamos tu ubicación
              </Text>
              <Text style={[text.caption, { color: colors.textSecondary, textAlign: "center", marginTop: vs(4) }]}>
                Actívala para ver los eventos artesanales cerca de ti en el mapa.
              </Text>
              <Pressable
                onPress={requestPermission}
                style={[local.permissionBtn, { backgroundColor: colors.primary, borderRadius: radii.md }]}
              >
                <Text style={[text.button, { color: colors.textOnPrimary }]}>Activar ubicación</Text>
              </Pressable>
            </View>
          )}

          {!eventsLoading && !eventsError && coords && events.length === 0 && (
            <View style={[local.emptyOverlay, { backgroundColor: colors.bgCard, borderRadius: radii.lg }, shadows.sm]}>
              <Text style={[text.body, { color: colors.textSecondary, textAlign: "center" }]}>
                No hay eventos cerca
              </Text>
            </View>
          )}

          {eventsLoading && (
            <View style={local.loadingPill}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </View>
      )}

      <Animated.View
        style={[
          local.sheet,
          { backgroundColor: colors.bgPage, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing[5] },
          shadows.lg,
          sheetStyle,
        ]}
        pointerEvents={selectedEvent ? "auto" : "none"}
      >
        {selectedEvent && (
          <>
            <View style={[local.sheetHandle, { backgroundColor: colors.handle }]} />
            <Text style={[text.h3, { color: colors.textPrimary }]} numberOfLines={1}>
              {selectedEvent.title}
            </Text>
            {selectedEvent.participants[0] && (
              <Text style={[text.caption, { color: colors.primaryDeep, marginTop: 2 }]}>
                {selectedEvent.participants[0].name}
              </Text>
            )}
            <Text style={[text.caption, { color: colors.textMuted, marginTop: vs(6) }]}>
              {formatEventDateLong(selectedEvent.event_date)}
            </Text>
            {!!selectedEvent.location && (
              <View style={local.addressRow}>
                <MaterialIcons name="place" size={16} color={colors.textMuted} />
                <Text style={[text.caption, { color: colors.textSecondary, marginLeft: 4, flex: 1 }]} numberOfLines={2}>
                  {selectedEvent.location}
                </Text>
              </View>
            )}
            <Pressable
              onPress={() => handleComoLlegar(selectedEvent)}
              style={[local.directionsBtn, { backgroundColor: colors.primary, borderRadius: radii.md }]}
            >
              <MaterialIcons name="directions" size={18} color={colors.textOnPrimary} />
              <Text style={[text.button, { color: colors.textOnPrimary, marginLeft: 6 }]}>Como llegar</Text>
            </Pressable>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

const local = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: s(32) },
  pin: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  topBanner: { position: "absolute", left: s(12), right: s(12) },
  banner: { flexDirection: "row", alignItems: "center" },
  bannerClose: { paddingHorizontal: s(10) },
  permissionCard: { position: "absolute", top: vs(16), left: s(20), right: s(20), alignItems: "center", borderWidth: 1 },
  permissionBtn: { marginTop: vs(12), paddingVertical: vs(10), paddingHorizontal: s(20) },
  emptyOverlay: { position: "absolute", top: "45%", left: s(40), right: s(40), paddingVertical: vs(14), alignItems: "center" },
  loadingPill: { position: "absolute", top: vs(12), alignSelf: "center" },
  sheet: { position: "absolute", bottom: 0, left: 0, right: 0, height: SHEET_HEIGHT },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: vs(12) },
  addressRow: { flexDirection: "row", alignItems: "flex-start", marginTop: vs(8) },
  directionsBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: vs(16), paddingVertical: vs(12) },
});