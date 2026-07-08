import { useState, useEffect, useCallback } from "react";
import { getEvent, requestParticipation, withdrawParticipation } from "@/api/events";
import { getStoreByOwner } from "@/api/stores";
import { useAuthStore } from "@/src/auth/authStore";
import type { EventItem } from "@/types/event";
import { normalizeError, type ApiError } from "@/src/api/errors";

export function useEventDetail(eventId: string | undefined) {
  const user = useAuthStore((s) => s.user);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [myStoreId, setMyStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isParticipationLoading, setIsParticipationLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEvent(eventId);
      setEvent(data);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    if (user?.role === "vendor") {
      getStoreByOwner(user.id)
        .then((store) => setMyStoreId(store?.id ?? null))
        .catch(() => setMyStoreId(null));
    }
  }, [user]);

  const requestMyParticipation = async () => {
    if (!eventId) return;
    setIsParticipationLoading(true);
    setError(null);
    try {
      await requestParticipation(eventId);
      await fetchEvent();
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsParticipationLoading(false);
    }
  };

  const withdrawMyParticipation = async () => {
    if (!eventId || !myStoreId) return;
    setIsParticipationLoading(true);
    setError(null);
    try {
      await withdrawParticipation(eventId, myStoreId);
      await fetchEvent();
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsParticipationLoading(false);
    }
  };

  return {
    event,
    myStoreId,
    isLoading,
    isParticipationLoading,
    error,
    refetch: fetchEvent,
    requestMyParticipation,
    withdrawMyParticipation,
  };
}
