// Shape of the backend's CartResponseDTO — grouped by store (each store's
// items are checked out as an independent StoreOrder), not a flat list.
export type CartItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url: string | null;
  variant_id: string | null;
  variant_name: string | null;
  variant_value: string | null;
  quantity: number;
  unit_price: string | number;
  subtotal: string | number;
};

export type CartStoreGroup = {
  id: string;
  store_id: string;
  store_name: string;
  subtotal_amount: string | number;
  items: CartItem[];
};

export type CartResponse = {
  order_id: string | null;
  buyer_id: string;
  total_amount: string | number;
  stores: CartStoreGroup[];
};
