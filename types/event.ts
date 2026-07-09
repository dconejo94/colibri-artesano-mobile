// Shape of the backend's EventResponseDTO / ParticipantResponseDTO
// (colibri-artesano-backend/src/app/domain/schemas/event.py). Events are
// admin-only to create/edit/delete; vendors request their own store's
// participation and an admin approves/rejects it — there is no buyer RSVP.
export type ParticipationStatus = "pending" | "approved" | "rejected";

export type StoreInEvent = {
  id: string;
  name: string;
  logo_url: string | null;
};

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  latitude: number;
  longitude: number;
  event_date: string; // ISO datetime, always carries a timezone offset
  cover_image_url: string | null;
  created_by: string;
  created_at: string;
  participants: StoreInEvent[]; // approved stores only
  my_participation: ParticipationStatus | null; // only set for the requesting vendor
};

export type EventParticipant = {
  id: string;
  event_id: string;
  store_id: string;
  store_name: string;
  status: ParticipationStatus;
  requested_by: string;
  reviewed_by: string | null;
  created_at: string;
};
