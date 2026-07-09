import { useState, useCallback } from 'react';
import axios from 'axios';

import { addToCart as addToCartRequest } from '@/api/cart';
import type { CartResponse } from '@/types/cart';

type AddToCartPayload = {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
};

export function useAddToCart() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const addToCart = useCallback(
    async (payload: AddToCartPayload): Promise<CartResponse | null> => {
      try {
        setIsLoading(true);
        setIsError(false);

        return await addToCartRequest(payload);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log('Status:', error.response?.status);
          console.log('Response:', error.response?.data);
          console.log('Payload:', payload);
        } else {
          console.log(error);
        }

        setIsError(true);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    addToCart,
    isLoading,
    isError,
  };
}
