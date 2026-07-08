// Shapes returned by GET /api/v1/search and /api/v1/search/autocomplete
// (colibri-artesano-backend/src/app/api/v1/search.py). Both endpoints branch
// on `scope` and return a different shape per branch, so every result here
// carries a `scope` tag (attached client-side in api/search.ts, since the
// backend payload itself doesn't include one) that callers can switch/narrow
// on instead of reaching for `any`.
import type { Product, Store, Category, PaginatedResponse } from './store';

export type SearchScope = 'all' | 'products' | 'stores' | 'categories';

// Autocomplete projections are deliberately leaner than the full Product/Store
// types (see ProductAutocompleteDTO / StoreAutocompleteDTO on the backend) —
// just enough for a suggestion row.
export type ProductAutocompleteResult = {
  id: string;
  name: string;
  base_price: string | number;
  primary_image_url: string | null;
};

export type StoreAutocompleteResult = {
  id: string;
  name: string;
  logo_url: string | null;
};

export type AutocompleteAllResult = {
  scope: 'all';
  products: ProductAutocompleteResult[];
  stores: StoreAutocompleteResult[];
  categories: Category[];
};

export type AutocompleteProductsResult = { scope: 'products'; items: ProductAutocompleteResult[] };
export type AutocompleteStoresResult = { scope: 'stores'; items: StoreAutocompleteResult[] };
export type AutocompleteCategoriesResult = { scope: 'categories'; items: Category[] };

export type AutocompleteResult =
  | AutocompleteAllResult
  | AutocompleteProductsResult
  | AutocompleteStoresResult
  | AutocompleteCategoriesResult;

// Full search results reuse the app-wide Product/Store types — same as
// useProducts.ts, since scope=products/stores hit the same list DTOs as the
// regular product/store list endpoints.
export type SearchAllResult = {
  scope: 'all';
  products: Product[];
  stores: Store[];
  categories: Category[];
};

export type SearchProductsResult = { scope: 'products' } & PaginatedResponse<Product>;
export type SearchStoresResult = { scope: 'stores' } & PaginatedResponse<Store>;
export type SearchCategoriesResult = { scope: 'categories'; items: Category[] };

export type SearchResult =
  | SearchAllResult
  | SearchProductsResult
  | SearchStoresResult
  | SearchCategoriesResult;
