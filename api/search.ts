import client from "./client";
import type { PaginatedResponse, Product } from "@/types/store";
import type {
  SearchScope,
  AutocompleteResult,
  SearchResult,
  ProductAutocompleteResult,
} from "@/types/search";

export type {
  SearchScope,
  ProductAutocompleteResult,
  StoreAutocompleteResult,
  AutocompleteResult,
  SearchResult,
} from "@/types/search";

export async function autocomplete(q: string, scope: SearchScope = 'all'): Promise<AutocompleteResult> {
  const { data } = await client.get('/api/v1/search/autocomplete', {
    params: { q, scope },
  });
  // The backend's payload shape already matches 1:1 per scope — `all` returns
  // { products, stores, categories }, everything else returns a bare array.
  // We just attach the `scope` tag so callers can narrow on it instead of `any`.
  if (scope === 'all') {
    return { scope: 'all', ...data };
  }
  return { scope, items: data } as AutocompleteResult;
}

export async function search(q: string, scope: SearchScope = 'all', page = 1, limit = 10): Promise<SearchResult> {
  const { data } = await client.get('/api/v1/search', {
    params: { q, scope, page, limit },
  });
  if (scope === 'all') {
    return { scope: 'all', ...data };
  }
  if (scope === 'categories') {
    // Only scope=categories skips pagination on the backend (plain array).
    return { scope: 'categories', items: data };
  }
  // scope=products / scope=stores: data is already a PaginatedResponse<T>.
  return { scope, ...data } as SearchResult;
}

// Keep legacy proxies for backward compatibility in case they are used elsewhere
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
