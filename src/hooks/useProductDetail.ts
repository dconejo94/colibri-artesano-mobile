import { useState, useEffect } from 'react';
import { getProduct } from '@/api/products';
import { ProductDetail as UIProductDetail } from '@/screens/ProductDetailScreen';
import { Product as BackendProduct } from '@/types/store';
import { normalizeError, type ApiError } from '@/src/api/errors';

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

        // Determine if available based on active flag and variants stock
        const isAvailable = data.is_active && (!(data.variants?.length ?? 0) || data.variants!.some(v => v.stock_quantity > 0));

        // Gather all image urls; copy before sorting to avoid mutating the API response
        const images = (data.images?.length ?? 0) > 0
          ? [...data.images!].sort((a, b) => Number(b.is_primary) - Number(a.is_primary)).map(img => img.image_url)
          : ['https://via.placeholder.com/600'];

        const mapped: UIProductDetail = {
          id: data.id,
          name: data.name,
          artisan: data.store?.name || 'Colibrí Artesano', // Maps to the backend store object
          price: Number(data.base_price) || 0,
          currency: 'CRC',
          images,
          status: isAvailable ? 'available' : 'sold_out',
          category: data.category?.name || 'Artesanía', // Maps to backend category name
          description: data.description || 'Sin descripción',
          // Optional fields from variants if needed
          materials: [],
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

