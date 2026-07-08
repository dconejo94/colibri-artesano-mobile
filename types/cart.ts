export interface CartLineItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url: string | null;

  variant_id: string | null;
  variant_name: string | null;
  variant_value: string | null;

  quantity: number;

  unit_price: string;
  subtotal: string;
}

export interface CartStoreGroup {
  id: string;
  store_id: string;
  store_name: string;

  subtotal_amount: string;
  items: CartLineItem[];
}

export interface Cart {
  order_id: string | null;
  buyer_id: string;
  total_amount: string;
  stores: CartStoreGroup[];
}

export interface AddToCartPayload {
  product_id: string;
  variant_id: string | null;
  quantity: number;
}