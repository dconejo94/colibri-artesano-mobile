import client from './client';
import type { StoreOrder } from '../types/store';
import type { CreatePaymentIntentResponse, Order } from "@/types/orders"

export async function createPaymentIntent(): Promise<CreatePaymentIntentResponse> {
  const { data } = await client.post<CreatePaymentIntentResponse>(
    '/api/v1/payments/create-intent',
  );
  return data;
}

export async function createOrder(): Promise<Order> {
  const { data } = await client.post('/api/v1/orders/');
  return data;
}