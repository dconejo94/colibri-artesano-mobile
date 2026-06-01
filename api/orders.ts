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
