import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";

export type LocationCoords = { latitude: number; longitude: number };

export function useLocation() {
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setIsLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo obtener tu ubicación");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return { coords, permissionStatus, isLoading, error, requestPermission };
}