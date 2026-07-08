import client from './client';
import {Cart, AddToCartPayload} from "@/types/cart"

export async function getCart(): Promise<Cart> {
  const { data } = await client.get<Cart>('/api/v1/cart/');
  return data;
}

export async function addToCart(payload: AddToCartPayload): Promise<Cart> {
  const { data } = await client.post<Cart>('/api/v1/cart/item', payload);
  return data;
}