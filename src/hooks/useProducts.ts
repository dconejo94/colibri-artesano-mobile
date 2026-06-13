import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '@/api/products';
import { Product as UIProduct } from '@/src/components/ProductCard';
import { Product as BackendProduct } from '@/types/store';

export function useProducts(options: { limit?: number; page?: number } = {}) {
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(options.page || 1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchProducts = useCallback(async (currentPage: number) => {
    try {
      setIsLoading(true);
      const response = await getProducts(currentPage, options.limit || 20);
      
      const uiProducts: UIProduct[] = response.items.map((p: BackendProduct) => {
        // Find primary image, fall back to first image, then placeholder
        const primaryImage = p.images?.find((img) => img.is_primary)?.image_url 
                          || p.images?.[0]?.image_url 
                          || 'https://via.placeholder.com/300';
                          
        // Derive availability from active flag and variant stock
        const isAvailable = p.is_active && (!(p.variants?.length ?? 0) || (p.variants ?? []).some(v => v.stock_quantity > 0));
        
        return {
          id: p.id,
          name: p.name,
          artisan: p.store?.name || 'Colibrí Artesano', // maps to backend store object
          price: Number(p.base_price) || 0,
          currency: 'CRC',
          imageUri: primaryImage,
          status: isAvailable ? 'available' : 'sold_out',
          category: p.category?.name || 'Artesanía', // maps to backend category name
          shortDescription: p.description?.substring(0, 50),
        };
      });

      if (currentPage === 1) {
        setProducts(uiProducts);
      } else {
        setProducts((prev) => [...prev, ...uiProducts]);
      }
      
      setHasNextPage(response.page * response.limit < response.total);
      setIsError(false);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [options.limit]);

  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  const fetchNextPage = () => {
    if (hasNextPage && !isLoading) {
      setPage((p) => p + 1);
    }
  };

  return { products, isLoading, isError, fetchNextPage, hasNextPage };
}
