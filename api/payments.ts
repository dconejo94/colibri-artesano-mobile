import client from './client';
import type { CreateOrderPayload, CreatePaymentIntentResponse, Order } from "@/types/orders"

export async function createPaymentIntent(): Promise<CreatePaymentIntentResponse> {
  const { data } = await client.post<CreatePaymentIntentResponse>(
    '/api/v1/payments/create-intent',
  );
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await client.post('/api/v1/orders/', payload);
  return data;
}
