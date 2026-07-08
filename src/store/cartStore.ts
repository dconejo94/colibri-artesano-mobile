/**
 * Cart badge count — cheap global state so Header/HamburgerMenu can show the
 * cart item count without every screen re-fetching /cart. The source of
 * truth is always the backend; this store is just a cache of the last known
 * count, updated from whatever CartResponse the app last saw.
 */
import { create } from "zustand";
import { getCart } from "@/api/cart";
import type { CartResponse } from "@/types/cart";

interface CartState {
  count: number;
  setFromCart: (cart: CartResponse) => void;
  reset: () => void;
  refresh: () => Promise<void>;
}

function countItems(cart: CartResponse): number {
  return cart.stores.reduce(
    (total, store) => total + store.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );
}

export const useCartStore = create<CartState>((set, get) => ({
  count: 0,
  setFromCart: (cart) => set({ count: countItems(cart) }),
  reset: () => set({ count: 0 }),
  refresh: async () => {
    try {
      const cart = await getCart();
      get().setFromCart(cart);
    } catch {
      // Badge is best-effort — a failed refresh just leaves the last known count.
    }
  },
}));
