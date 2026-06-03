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

// -- Buyer Endpoints --------------------------------------------------------

export async function createOrder(body: {
  buyer_id: string;
  items: Array<{
    product_id: string;
    variant_id?: string | null;
    quantity: number;
  }>;
}) {
  const { data } = await client.post("/api/v1/orders/", body);
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
