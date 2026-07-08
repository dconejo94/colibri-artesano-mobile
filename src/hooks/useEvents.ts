import { useState, useEffect, useCallback } from "react";
import { getEvents } from "@/api/events";
import type { EventItem } from "@/types/event";
import { normalizeError, type ApiError } from "@/src/api/errors";

export function useEvents(options: { limit?: number } = {}) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchEvents = useCallback(async (targetPage = 1, append = false) => {
    if (targetPage === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);
    try {
      const res = await getEvents(targetPage, options.limit || 20);
      setEvents((prev) => (append ? [...prev, ...res.items] : res.items));
      setTotal(res.total);
      setPage(targetPage);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [options.limit]);

  useEffect(() => {
    fetchEvents(1);
  }, [fetchEvents]);

  const fetchNextPage = () => {
    if (!isLoadingMore && events.length < total) fetchEvents(page + 1, true);
  };

  return {
    events,
    isLoading,
    isLoadingMore,
    error,
    hasMore: events.length < total,
    fetchNextPage,
    refetch: () => fetchEvents(1),
  };
}
