import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";

export type LocationCoords = { latitude: number; longitude: number };

// autoRequest: whether to request permission/location as soon as the hook
// mounts (e.g. the map screen) vs. only on explicit user action (e.g. the
// event form, where popping the OS permission dialog on screen-open would
// be surprising).
export function useLocation(autoRequest = true) {
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(autoRequest);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async (): Promise<LocationCoords | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setIsLoading(false);
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoords(nextCoords);
      return nextCoords;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo obtener tu ubicación");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoRequest) requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRequest]);

  return { coords, permissionStatus, isLoading, error, requestPermission };
}
