import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '@/api/products';
import { Product as UIProduct } from '@/src/components/ProductCard';
import { Product as BackendProduct } from '@/types/store';
import { normalizeError, type ApiError } from '@/src/api/errors';
import { resolveProductImage } from '@/utils/resolveProductImage';

export function useProducts(options: { 
  limit?: number; 
  page?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
} = {}) {
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [page, setPage] = useState(options.page || 1);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Reset page and products when filters change
  useEffect(() => {
    setPage(1);
    setProducts([]);
  }, [options.search, options.categoryId, options.minPrice, options.maxPrice]);

  const fetchProducts = useCallback(async (currentPage: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getProducts(
        currentPage, 
        options.limit || 20,
        options.search,
        options.categoryId,
        options.minPrice,
        options.maxPrice
      );

      const uiProducts: UIProduct[] = response.items.map((p: BackendProduct) => {
        // Cover image — resolved from variants[].images[]
        const primaryImage = resolveProductImage(p);

        // Derive availability from active flag and variant stock
        const isAvailable = p.is_active && (!(p.variants?.length ?? 0) || (p.variants ?? []).some(v => v.stock_quantity > 0));

        return {
          id: p.id,
          name: p.name,
          artisan: p.store?.name || 'Colibrí Artesano',
          storeId: p.store?.id,
          price: Number(p.base_price) || 0,
          currency: 'CRC',
          imageUri: primaryImage,
          status: isAvailable ? 'available' : 'sold_out',
          category: p.category?.name || 'Artesanía',
          shortDescription: p.description?.substring(0, 50),
        };
      });

      if (currentPage === 1) {
        setProducts(uiProducts);
      } else {
        setProducts((prev) => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = uiProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newItems];
        });
      }
      
      setHasNextPage(response.page * response.limit < response.total);
      setError(null);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
    }
  }, [options.limit, options.search, options.categoryId, options.minPrice, options.maxPrice]);

  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  const fetchNextPage = () => {
    if (hasNextPage && !isLoading) {
      setPage((p) => p + 1);
    }
  };

  return { products, isLoading, error, fetchNextPage, hasNextPage, refetch: () => fetchProducts(page) };
}

