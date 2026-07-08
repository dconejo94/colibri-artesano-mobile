import { useState, useEffect, useCallback } from "react";
import { getCart, addToCart, updateCartItem, removeCartItem } from "@/api/cart";
import { checkout as checkoutOrder } from "@/api/orders";
import { useCartStore } from "@/src/store/cartStore";
import type { CartResponse, CartItem } from "@/types/cart";
import { normalizeError, type ApiError } from "@/src/api/errors";

// Looks up the store group id (needed as `store_order_id` on PATCH/DELETE)
// that a given cart item belongs to.
function findStoreOrderId(cart: CartResponse, item: CartItem): string | undefined {
  return cart.stores.find((s) => s.items.some((i) => i.id === item.id))?.id;
}

export function useCart() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const setCartCount = useCartStore((s) => s.setFromCart);

  const applyCart = useCallback(
    (next: CartResponse) => {
      setCart(next);
      setCartCount(next);
    },
    [setCartCount]
  );

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCart();
      applyCart(data);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
    }
  }, [applyCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const runMutation = async (fn: () => Promise<CartResponse>) => {
    setIsMutating(true);
    setError(null);
    try {
      const next = await fn();
      applyCart(next);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsMutating(false);
    }
  };

  const add = (productId: string, variantId?: string | null, quantity = 1) =>
    runMutation(() => addToCart({ product_id: productId, variant_id: variantId, quantity }));

  const setQuantity = (item: CartItem, quantity: number) => {
    if (!cart) return Promise.resolve();
    const storeOrderId = findStoreOrderId(cart, item);
    if (!storeOrderId) return Promise.resolve();
    if (quantity <= 0) {
      return runMutation(() =>
        removeCartItem({ product_id: item.product_id, variant_id: item.variant_id, store_order_id: storeOrderId })
      );
    }
    return runMutation(() =>
      updateCartItem({
        product_id: item.product_id,
        variant_id: item.variant_id,
        store_order_id: storeOrderId,
        quantity,
      })
    );
  };

  const increment = (item: CartItem) => setQuantity(item, item.quantity + 1);
  const decrement = (item: CartItem) => setQuantity(item, item.quantity - 1);
  const remove = (item: CartItem) => setQuantity(item, 0);

  const checkout = async () => {
    setIsMutating(true);
    setError(null);
    try {
      await checkoutOrder();
      useCartStore.getState().reset();
      setCart(null);
      await fetchCart();
      return true;
    } catch (err) {
      setError(normalizeError(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    cart,
    isLoading,
    isMutating,
    error,
    refetch: fetchCart,
    add,
    increment,
    decrement,
    remove,
    checkout,
  };
}
