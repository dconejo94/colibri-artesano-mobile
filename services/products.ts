import client from "@/api/client";

export type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  category?: string;
};

export type ProductsResponse = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
};

export async function getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
}): Promise<ProductsResponse> {
  const response = await client.get<ProductsResponse>("/products", { params });
  return response.data;
}

export async function getProductById(id: number): Promise<Product> {
  const response = await client.get<Product>(`/products/${id}`);
  return response.data;
}
