import { useState, useCallback } from 'react';
import axios from 'axios';
import {
  addToCart as addToCartRequest,
  AddToCartPayload,
  Cart,
} from '@/api/cart';

export function useAddToCart() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const addToCart = useCallback(async (payload: AddToCartPayload): Promise<Cart | null> => {
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
  }, []);

  return { addToCart, isLoading, isError };
}