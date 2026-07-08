import client from "./client";
import type { CartResponse } from "@/types/cart";

export async function getCart(): Promise<CartResponse> {
  const { data } = await client.get<CartResponse>("/api/v1/cart/");
  return data;
}

export async function addToCart(body: {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
}): Promise<CartResponse> {
  const { data } = await client.post<CartResponse>("/api/v1/cart/item", body);
  return data;
}

export async function updateCartItem(params: {
  product_id: string;
  variant_id?: string | null;
  store_order_id: string;
  quantity: number;
}): Promise<CartResponse> {
  const { product_id, ...query } = params;
  const { data } = await client.patch<CartResponse>(
    `/api/v1/cart/item/${product_id}`,
    null,
    { params: query }
  );
  return data;
}

export async function removeCartItem(params: {
  product_id: string;
  variant_id?: string | null;
  store_order_id: string;
}): Promise<CartResponse> {
  const { product_id, ...query } = params;
  const { data } = await client.delete<CartResponse>(
    `/api/v1/cart/item/${product_id}`,
    { params: query }
  );
  return data;
}
