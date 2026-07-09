import client from "./client";
import type {
  Product,
  ProductImage,
  ProductVariant,
  PaginatedResponse,
} from "@/types/store";


export async function getProducts(
  page = 1,
  limit = 20,
  search?: string,
  categoryId?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<PaginatedResponse<Product>> {
  const { data } = await client.get<PaginatedResponse<Product>>(
    "/api/v1/products/",
    { params: { page, limit, search, category_id: categoryId, min_price: minPrice, max_price: maxPrice } }
  );
  return data;
}

export async function getStoreProducts(
  storeId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Product>> {
  const { data } = await client.get<PaginatedResponse<Product>>(
    `/api/v1/stores/${storeId}/products/`,
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
  const { data } = await client.put<Product>(
    `/api/v1/products/${productId}`,
    body
  );
  return data;
}

export async function favoriteProduct(productId: string): Promise<void> {
  await client.post(`/api/v1/products/${productId}/favorite`);
}

export async function unfavoriteProduct(productId: string): Promise<void> {
  await client.delete(`/api/v1/products/${productId}/favorite`);
}


// ── Images (variant-scoped) ─────────────────────────────────────────────────
// Backend routes images under variants:
//   POST /products/{id}/variants/{vid}/images/upload-url  → SAS token
//   POST /products/{id}/variants/{vid}/images             → register image

export interface UploadUrlResponse {
  upload_url: string;
  blob_url: string;
  expires_at: string;
}

/** Request a short-lived SAS URL for a direct-to-blob upload. */
export async function getUploadUrl(
  productId: string,
  variantId: string,
  filename: string,
  contentType: string
): Promise<UploadUrlResponse> {
  const { data } = await client.post<UploadUrlResponse>(
    `/api/v1/products/${productId}/variants/${variantId}/images/upload-url`,
    { filename, content_type: contentType }
  );
  return data;
}

/**
 * PUT the raw image bytes to the SAS-signed upload URL.
 * Uses fetch (not axios) because we're uploading to Azure/Azurite, not our API.
 */
export async function uploadImageToBlob(
  uploadUrl: string,
  fileUri: string,
  contentType: string
): Promise<void> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-ms-blob-type": "BlockBlob",
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
  }
}

/** Register an already-uploaded image in the database. */
export async function addProductImage(
  productId: string,
  variantId: string,
  body: { image_url: string; is_primary: boolean }
): Promise<ProductImage> {
  const { data } = await client.post<ProductImage>(
    `/api/v1/products/${productId}/variants/${variantId}/images`,
    body
  );
  return data;
}

export async function deleteProductImage(
  productId: string,
  variantId: string,
  imageId: string
): Promise<void> {
  await client.delete(
    `/api/v1/products/${productId}/variants/${variantId}/images/${imageId}`
  );
}

/** Mark an image as the primary (cover) image for its variant. */
export async function setPrimaryImage(
  productId: string,
  variantId: string,
  imageId: string
): Promise<void> {
  await client.patch(
    `/api/v1/products/${productId}/variants/${variantId}/images/${imageId}/primary`
  );
}

/**
 * Request a SAS URL and PUT the bytes to blob storage, returning the public
 * blob_url to register. The SAS is short-lived, so if the PUT fails (e.g. the
 * token expired between issue and upload) this requests a fresh URL and retries
 * the upload once.
 */
export async function uploadImageWithRetry(
  productId: string,
  variantId: string,
  fileUri: string,
  filename: string,
  contentType: string
): Promise<string> {
  const first = await getUploadUrl(productId, variantId, filename, contentType);
  try {
    await uploadImageToBlob(first.upload_url, fileUri, contentType);
    return first.blob_url;
  } catch {
    const retry = await getUploadUrl(productId, variantId, filename, contentType);
    await uploadImageToBlob(retry.upload_url, fileUri, contentType);
    return retry.blob_url;
  }
}


// ── Variants ────────────────────────────────────────────────────────────────

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
  const { data } = await client.put<ProductVariant>(
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
