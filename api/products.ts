import client from "./client";
import type {
  Product,
  ProductImage,
  ProductVariant,
  PaginatedResponse,
} from "@/types/store";

// -- Products ---------------------------------------------------------------

export async function getProducts(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Product>> {
  const { data } = await client.get<PaginatedResponse<Product>>(
    "/api/v1/products",
    { params: { page, limit } }
  );
  return data;
}

export async function getStoreProducts(
  storeId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Product>> {
  const { data } = await client.get<PaginatedResponse<Product>>(
    `/api/v1/stores/${storeId}/products`,
    { params: { page, limit } }
  );
  return data;
}

export async function getProduct(productId: string): Promise<Product> {
  const { data } = await client.get<Product>(
    `/api/v1/products/${productId}`
  );
  return data;
}

export async function createProduct(
  storeId: string,
  body: {
    category_id: string;
    name: string;
    description: string;
    base_price: number;
  }
): Promise<Product> {
  const { data } = await client.post<Product>(
    `/api/v1/stores/${storeId}/products`,
    body
  );
  return data;
}

export async function updateProduct(
  productId: string,
  body: Partial<{
    name: string;
    description: string;
    base_price: number;
    category_id: string;
    is_active: boolean;
  }>
): Promise<Product> {
  const { data } = await client.patch<Product>(
    `/api/v1/products/${productId}`,
    body
  );
  return data;
}

// -- Images -----------------------------------------------------------------

export async function addProductImage(
  productId: string,
  body: { image_url: string; is_primary: boolean }
): Promise<ProductImage> {
  const { data } = await client.post<ProductImage>(
    `/api/v1/products/${productId}/images`,
    body
  );
  return data;
}

export async function deleteProductImage(
  productId: string,
  imageId: string
): Promise<void> {
  await client.delete(`/api/v1/products/${productId}/images/${imageId}`);
}

// -- Variants ---------------------------------------------------------------

export async function addProductVariant(
  productId: string,
  body: {
    name: string;
    value: string;
    price_modifier: number;
    stock_quantity: number;
  }
): Promise<ProductVariant> {
  const { data } = await client.post<ProductVariant>(
    `/api/v1/products/${productId}/variants`,
    body
  );
  return data;
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  body: Partial<{
    name: string;
    value: string;
    price_modifier: number;
    stock_quantity: number;
  }>
): Promise<ProductVariant> {
  const { data } = await client.patch<ProductVariant>(
    `/api/v1/products/${productId}/variants/${variantId}`,
    body
  );
  return data;
}

export async function deleteProductVariant(
  productId: string,
  variantId: string
): Promise<void> {
  await client.delete(
    `/api/v1/products/${productId}/variants/${variantId}`
  );
}
