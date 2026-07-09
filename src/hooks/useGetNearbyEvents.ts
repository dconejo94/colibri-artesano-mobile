import { useState, useEffect, useCallback } from "react";
import { getNearbyEvents } from "@/api/events";
import type { EventItem } from "@/types/event";
import { normalizeError, type ApiError } from "@/src/api/errors";
import type { LocationCoords } from "@/src/hooks/useLocation";

const RADIUS_KM = 25;

export function useNearbyEvents(coords: LocationCoords | null) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchNearby = useCallback(async () => {
    if (!coords) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getNearbyEvents(coords.latitude, coords.longitude, RADIUS_KM, 1, 100);
      setEvents(res.items);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
    }
  }, [coords?.latitude, coords?.longitude]);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  return { events, isLoading, error, refetch: fetchNearby };
}