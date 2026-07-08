import client from "./client";
import type { PaginatedResponse, Product, Store, Category } from "@/types/store";

export type SearchScope = 'all' | 'products' | 'stores' | 'categories';

export interface AutocompleteResponse {
  products?: Product[];
  stores?: Store[];
  categories?: Category[];
}

export interface SearchResponse {
  products?: Product[];
  stores?: Store[];
  categories?: Category[];
}

export async function autocomplete(q: string, scope: SearchScope = 'all'): Promise<AutocompleteResponse | any[]> {
  const { data } = await client.get('/api/v1/search/autocomplete', {
    params: { q, scope },
  });
  return data;
}

export async function search(q: string, scope: SearchScope = 'all', page = 1, limit = 10): Promise<SearchResponse | PaginatedResponse<any>> {
  const { data } = await client.get('/api/v1/search', {
    params: { q, scope, page, limit },
  });
  return data;
}

// Keep legacy proxies for backward compatibility in case they are used elsewhere
export type ProductAutocompleteResult = {
  id: string;
  name: string;
  base_price: string | number;
  primary_image_url: string | null;
};

export async function searchProducts(
  q: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Product>> {
  const { data } = await client.get<PaginatedResponse<Product>>(
    "/api/v1/products/search",
    { params: { q, page, limit } }
  );
  return data;
}

export async function autocompleteProducts(
  q: string
): Promise<ProductAutocompleteResult[]> {
  const { data } = await client.get<ProductAutocompleteResult[]>(
    "/api/v1/products/autocomplete",
    { params: { q } }
  );
  return data;
}
