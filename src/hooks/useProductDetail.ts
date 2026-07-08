import { useState, useEffect } from 'react';
import {
  getProduct,
  getProductVariants,
} from '@/api/products';

import { ProductDetail as UIProductDetail } from '@/screens/ProductDetailScreen';

export function useProductDetail(id: string) {
  const [product, setProduct] =
    useState<UIProductDetail | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isError, setIsError] =
    useState(false);


  useEffect(() => {
    if (!id) return;

    let isMounted = true;


    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const [data, variants] = await Promise.all([
          getProduct(id),
          getProductVariants(id),
        ]);


        if (!isMounted) return;


        const isAvailable =
          data.is_active &&
          variants.some(
            (variant) =>
              variant.stock_quantity > 0
          );


        const images =
          data.images?.length
            ? [...data.images]
                .sort(
                  (a, b) =>
                    Number(b.is_primary) -
                    Number(a.is_primary)
                )
                .map(
                  (image) =>
                    image.image_url
                )
            : [
                'https://via.placeholder.com/600'
              ];


        const mapped: UIProductDetail = {
          id: data.id,
          name: data.name,
          artisan:
            data.store?.name ??
            'Colibrí Artesano',

          price:
            Number(data.base_price) || 0,

          currency: 'CRC',

          images,

          status:
            isAvailable
              ? 'available'
              : 'sold_out',

          category:
            data.category?.name ??
            'Artesanía',

          description:
            data.description ??
            'Sin descripción',

          variants,

          materials: [],
        };


        setProduct(mapped);

      } catch (error) {
        console.error(error);

        if (isMounted) {
          setIsError(true);
        }

      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };


    fetchProduct();

    return () => {
      isMounted = false;
    };

  }, [id]);


  return {
    product,
    isLoading,
    isError,
  };
}