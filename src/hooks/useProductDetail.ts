import { useState, useEffect } from 'react';
import { getProduct } from '@/api/products';
import { ProductDetail as UIProductDetail } from '@/screens/ProductDetailScreen';
import { Product as BackendProduct } from '@/types/store';

export function useProductDetail(id: string) {
  const [product, setProduct] = useState<UIProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const data: BackendProduct = await getProduct(id);
        
        if (!isMounted) return;

        // Determine if available based on active flag and variants stock
        const isAvailable = data.is_active && (!data.variants?.length || data.variants.some(v => v.stock_quantity > 0));

        // Gather all image urls
        const images = data.images?.length > 0 
          ? data.images.sort((a, b) => (a.is_primary === b.is_primary) ? 0 : a.is_primary ? -1 : 1).map(img => img.image_url) 
          : ['https://via.placeholder.com/600'];

        const mapped: UIProductDetail = {
          id: data.id,
          name: data.name,
          artisan: 'Colibrí Artesano', // Default until stores are loaded
          price: Number(data.base_price) || 0,
          currency: 'CRC',
          images,
          status: isAvailable ? 'available' : 'sold_out',
          category: 'Artesanía', // Default category
          description: data.description || 'Sin descripción',
          // Optional fields from variants if needed
          materials: [],
        };
        
        setProduct(mapped);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        if (isMounted) setIsError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProduct();
    return () => { isMounted = false; };
  }, [id]);

  return { product, isLoading, isError };
}
