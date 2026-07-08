import client from "./client";
import type { StoreOrder, PaginatedResponse } from "@/types/store";

export async function getStoreOrders(
  storeId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<StoreOrder>> {
  const { data } = await client.get<PaginatedResponse<StoreOrder>>(
    `/api/v1/stores/${storeId}/orders`,
    { params: { page, limit } }
  );
  return data;
}

export async function getStoreSalesSummary(storeId: string): Promise<{ total_orders: number; total_sales: number }> {
  const { data } = await client.get<{ total_orders: number; total_sales: number }>(
    `/api/v1/stores/${storeId}/sales`
  );
  return data;
}

export async function updateOrderStatus(
  storeId: string,
  storeOrderId: string,
  sellerStatus: string
): Promise<StoreOrder> {
  const { data } = await client.patch<StoreOrder>(
    `/api/v1/stores/${storeId}/orders/${storeOrderId}/status`,
    { seller_status: sellerStatus }
  );
  return data;
}


// Places an order from the buyer's current cart — the backend derives the
// items from GET /cart server-side, so this call takes no body.
export async function checkout() {
  const { data } = await client.post("/api/v1/orders/");
  return data;
}

export async function getOrder(orderId: string) {
  const { data } = await client.get(`/api/v1/orders/${orderId}`);
  return data;
}

export async function getBuyerOrders(
  buyerId: string,
  page = 1,
  limit = 20
) {
  const { data } = await client.get(`/api/v1/orders/`, {
    params: { buyer_id: buyerId, page, limit }
  });
  return data;
}
