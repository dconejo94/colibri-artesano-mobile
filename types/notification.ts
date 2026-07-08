// Shape of the backend's NotificationResponseDTO.
// `type` is a free string; the backend currently only emits "order_confirmed"
// and "new_product", but the UI treats unknown types with a generic fallback.
export type NotificationType = "order_confirmed" | "new_product" | string;

export type Notification = {
  id: string;
  title: string;
  body: string | null;
  type: NotificationType;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
};
