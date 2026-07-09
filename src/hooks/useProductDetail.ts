import { useState, useEffect } from 'react';
import { getProduct } from '@/api/products';
import { ProductDetail as UIProductDetail } from '@/screens/ProductDetailScreen';
import { Product as BackendProduct } from '@/types/store';
import { normalizeError, type ApiError } from '@/src/api/errors';
import { resolveAllProductImages } from '@/utils/resolveProductImage';

export function useProductDetail(id: string) {
  const [product, setProduct] = useState<UIProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data: BackendProduct = await getProduct(id);

        if (!isMounted) return;

        const variants = data.variants ?? [];

        // Determine if available based on active flag and variants stock
        const isAvailable =
          data.is_active &&
          (variants.length === 0 || variants.some((v) => v.stock_quantity > 0));

        // Gallery images — resolved from variants[].images[]
        const images = resolveAllProductImages(data);

        const mapped: UIProductDetail = {
          id: data.id,
          name: data.name,
          artisan: data.store?.name || 'Colibrí Artesano',
          artisanStoreId: data.store?.id,
          artisanBio: data.store?.description || undefined,
          price: Number(data.base_price) || 0,
          currency: 'CRC',
          images,
          status: isAvailable ? 'available' : 'sold_out',
          category: data.category?.name || 'Artesanía',
          description: data.description || 'Sin descripción',
          materials: [],
          variants,
        };

        setProduct(mapped);
      } catch (err) {
        if (isMounted) setError(normalizeError(err));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProduct();
    return () => { isMounted = false; };
  }, [id, retryCount]);

  const refetch = () => setRetryCount((prev) => prev + 1);

  return { product, isLoading, error, refetch };
}
