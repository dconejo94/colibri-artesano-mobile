import type {StoreOrder} from "@/types/store"

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}
export interface Order {
  id: string;
  buyer_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  store_orders: StoreOrder[];
}