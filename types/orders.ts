import type {StoreOrder} from "@/types/store"

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface ShippingAddressPayload {
  recipient: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface CreateOrderPayload {
  shipping_address: ShippingAddressPayload;
}

export interface Order {
  id: string;
  buyer_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  store_orders: StoreOrder[];
}
