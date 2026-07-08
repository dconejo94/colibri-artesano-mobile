import { useState, useEffect, useCallback } from 'react';
import { getCart } from '@/api/cart';
import type { Cart } from "@/types/cart"

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCart();
      setCart(data);
      setIsError(false);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return { cart, isLoading, isError, refetch: fetchCart };
}