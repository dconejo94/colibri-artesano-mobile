import client from "./client";
import type { PaginatedResponse } from "@/types/store";
import type { EventItem, EventParticipant, ParticipationStatus } from "@/types/event";

export async function getEvents(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<EventItem>> {
  const { data } = await client.get<PaginatedResponse<EventItem>>("/api/v1/events/", {
    params: { page, limit },
  });
  return data;
}

export async function getEvent(eventId: string): Promise<EventItem> {
  const { data } = await client.get<EventItem>(`/api/v1/events/${eventId}`);
  return data;
}

export type EventPayload = {
  title: string;
  description?: string | null;
  location?: string | null;
  event_date: string;
  cover_image_url?: string | null;
};

export async function createEvent(body: EventPayload): Promise<EventItem> {
  const { data } = await client.post<EventItem>("/api/v1/events/", body);
  return data;
}

export async function updateEvent(
  eventId: string,
  body: Partial<EventPayload>
): Promise<EventItem> {
  const { data } = await client.patch<EventItem>(`/api/v1/events/${eventId}`, body);
  return data;
}

export async function deleteEvent(eventId: string): Promise<void> {
  await client.delete(`/api/v1/events/${eventId}`);
}

// Vendor requests their own store's participation — the backend resolves the
// store from the authenticated user, so no store_id is sent.
export async function requestParticipation(eventId: string): Promise<EventParticipant> {
  const { data } = await client.post<EventParticipant>(`/api/v1/events/${eventId}/participants`);
  return data;
}

export async function withdrawParticipation(eventId: string, storeId: string): Promise<void> {
  await client.delete(`/api/v1/events/${eventId}/participants/${storeId}`);
}

// Admin-only.
export async function listParticipants(eventId: string): Promise<EventParticipant[]> {
  const { data } = await client.get<EventParticipant[]>(`/api/v1/events/${eventId}/participants`);
  return data;
}

export async function reviewParticipation(
  eventId: string,
  storeId: string,
  status: ParticipationStatus
): Promise<EventParticipant> {
  const { data } = await client.patch<EventParticipant>(
    `/api/v1/events/${eventId}/participants/${storeId}`,
    { status }
  );
  return data;
}
