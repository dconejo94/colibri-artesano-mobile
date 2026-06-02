// Formats a numeric amount into Costa Rican colones for display.
export function formatPrice(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `\u20A1 0`;
  return `\u20A1 ${num.toLocaleString("es-CR", { minimumFractionDigits: 0 })}`;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

// Translates an order status key into a human-readable Spanish label.
export function translateStatus(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  processing: "#3B82F6",
  shipped: "#6B9E98",
  delivered: "#10B981",
  cancelled: "#EF4444",
};

// Returns the background color hex string for a given order status.
export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? "#687076";
}
