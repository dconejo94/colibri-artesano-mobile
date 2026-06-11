export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_modifier: string | number;
  stock_quantity: number;
};

export type Product = {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description: string;
  base_price: string | number;
  is_active: boolean;
  images?: ProductImage[];
  variants?: ProductVariant[];
  store?: Store;
  category?: Category;
  created_at: string;
  updated_at: string;
};

export type Store = {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  logo_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: string | number;
  product?: Product;
};

export type StoreOrder = {
  id: string;
  order_id: string;
  store_id: string;
  seller_status: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};
