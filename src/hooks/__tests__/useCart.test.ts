import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useCart } from "@/src/hooks/useCart";
import { useCartStore } from "@/src/store/cartStore";
import { getCart, addToCart, updateCartItem, removeCartItem } from "@/api/cart";
import { checkout as checkoutOrder } from "@/api/orders";
import type { CartResponse, CartItem } from "@/types/cart";

jest.mock("@/api/cart", () => ({
  getCart: jest.fn(),
  addToCart: jest.fn(),
  updateCartItem: jest.fn(),
  removeCartItem: jest.fn(),
}));

jest.mock("@/api/orders", () => ({
  checkout: jest.fn(),
}));

const mockGetCart = getCart as jest.Mock;
const mockAddToCart = addToCart as jest.Mock;
const mockUpdateCartItem = updateCartItem as jest.Mock;
const mockRemoveCartItem = removeCartItem as jest.Mock;
const mockCheckoutOrder = checkoutOrder as jest.Mock;

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "item-1",
    product_id: "product-1",
    product_name: "Vasija de barro",
    product_image_url: null,
    variant_id: "variant-1",
    variant_name: "Tamaño",
    variant_value: "Grande",
    quantity: 2,
    unit_price: 1000,
    subtotal: 2000,
    ...overrides,
  };
}

function makeCart(overrides: Partial<CartResponse> = {}, items: CartItem[] = [makeItem()]): CartResponse {
  return {
    order_id: null,
    buyer_id: "buyer-1",
    total_amount: items.reduce((sum, i) => sum + Number(i.subtotal), 0),
    stores: [
      {
        id: "store-order-1",
        store_id: "store-1",
        store_name: "Tienda Uno",
        subtotal_amount: items.reduce((sum, i) => sum + Number(i.subtotal), 0),
        items,
      },
    ],
    ...overrides,
  };
}

const emptyCart = (): CartResponse => makeCart({}, []);

beforeEach(() => {
  jest.clearAllMocks();
  useCartStore.setState({ count: 0 });
});

describe("useCart", () => {
  it("fetches the cart on mount and populates the cart badge count", async () => {
    const cart = makeCart({}, [makeItem({ quantity: 3 })]);
    mockGetCart.mockResolvedValueOnce(cart);

    const { result } = await renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cart).toEqual(cart);
    expect(result.current.error).toBeNull();
    expect(useCartStore.getState().count).toBe(3);
  });

  it("surfaces a normalized error when the initial fetch fails, without crashing", async () => {
    mockGetCart.mockRejectedValueOnce(new Error("network down"));

    const { result } = await renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cart).toBeNull();
    expect(result.current.error).toEqual({
      status: null,
      message: "Algo salió mal. Intenta de nuevo.",
    });
  });

  it("add() posts the product/variant/quantity and applies the returned cart", async () => {
    mockGetCart.mockResolvedValueOnce(emptyCart());
    const updated = makeCart({}, [makeItem({ quantity: 1 })]);
    mockAddToCart.mockResolvedValueOnce(updated);

    const { result } = await renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.add("product-1", "variant-1", 1);
    });

    expect(mockAddToCart).toHaveBeenCalledWith({
      product_id: "product-1",
      variant_id: "variant-1",
      quantity: 1,
    });
    expect(result.current.cart).toEqual(updated);
    expect(useCartStore.getState().count).toBe(1);
  });

  it("increment sends quantity + 1 for the right store_order_id", async () => {
    const item = makeItem({ quantity: 2 });
    const cart = makeCart({}, [item]);
    mockGetCart.mockResolvedValueOnce(cart);
    const updated = makeCart({}, [{ ...item, quantity: 3, subtotal: 3000 }]);
    mockUpdateCartItem.mockResolvedValueOnce(updated);

    const { result } = await renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.increment(item);
    });

    expect(mockUpdateCartItem).toHaveBeenCalledWith({
      product_id: item.product_id,
      variant_id: item.variant_id,
      store_order_id: "store-order-1",
      quantity: 3,
    });
    expect(result.current.cart).toEqual(updated);
    expect(useCartStore.getState().count).toBe(3);
  });

  it("decrement above 1 sends quantity - 1 via updateCartItem", async () => {
    const item = makeItem({ quantity: 2 });
    mockGetCart.mockResolvedValueOnce(makeCart({}, [item]));
    mockUpdateCartItem.mockResolvedValueOnce(makeCart({}, [{ ...item, quantity: 1, subtotal: 1000 }]));

    const { result } = await renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.decrement(item);
    });

    expect(mockUpdateCartItem).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 1 })
    );
    expect(mockRemoveCartItem).not.toHaveBeenCalled();
  });

  it("decrementing the last unit removes the item instead of sending quantity 0", async () => {
    const item = makeItem({ quantity: 1 });
    mockGetCart.mockResolvedValueOnce(makeCart({}, [item]));
    mockRemoveCartItem.mockResolvedValueOnce(emptyCart());

    const { result } = await renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.decrement(item);
    });

    expect(mockRemoveCartItem).toHaveBeenCalledWith({
      product_id: item.product_id,
      variant_id: item.variant_id,
      store_order_id: "store-order-1",
    });
    expect(mockUpdateCartItem).not.toHaveBeenCalled();
    expect(result.current.cart).toEqual(emptyCart());
    expect(useCartStore.getState().count).toBe(0);
  });

  it("remove() always calls removeCartItem regardless of current quantity", async () => {
    const item = makeItem({ quantity: 5 });
    mockGetCart.mockResolvedValueOnce(makeCart({}, [item]));
    mockRemoveCartItem.mockResolvedValueOnce(emptyCart());

    const { result } = await renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.remove(item);
    });

    expect(mockRemoveCartItem).toHaveBeenCalledWith({
      product_id: item.product_id,
      variant_id: item.variant_id,
      store_order_id: "store-order-1",
    });
  });

  it("is a no-op when the cart hasn't loaded yet", async () => {
    // Never resolves during this test — cart stays null.
    mockGetCart.mockReturnValueOnce(new Promise(() => {}));
    const item = makeItem();

    const { result } = await renderHook(() => useCart());

    await act(async () => {
      await result.current.increment(item);
    });

    expect(mockUpdateCartItem).not.toHaveBeenCalled();
    expect(mockRemoveCartItem).not.toHaveBeenCalled();
  });

  it("is a no-op when the item no longer belongs to any store group in the cart", async () => {
    mockGetCart.mockResolvedValueOnce(makeCart({}, [makeItem({ id: "item-1" })]));

    const { result } = await renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const staleItem = makeItem({ id: "item-does-not-exist" });
    await act(async () => {
      await result.current.increment(staleItem);
    });

    expect(mockUpdateCartItem).not.toHaveBeenCalled();
    expect(mockRemoveCartItem).not.toHaveBeenCalled();
  });

  it("keeps the previous cart on screen when a mutation fails", async () => {
    const item = makeItem({ quantity: 2 });
    const cart = makeCart({}, [item]);
    mockGetCart.mockResolvedValueOnce(cart);
    mockUpdateCartItem.mockRejectedValueOnce(new Error("conflict"));

    const { result } = await renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.increment(item);
    });

    expect(result.current.cart).toEqual(cart); // unchanged
    expect(result.current.error).not.toBeNull();
    expect(result.current.isMutating).toBe(false);
  });

  describe("checkout", () => {
    it("on success: places the order, resets the cart badge, and refetches", async () => {
      const cart = makeCart({}, [makeItem({ quantity: 2 })]);
      mockGetCart.mockResolvedValueOnce(cart); // initial mount fetch
      mockCheckoutOrder.mockResolvedValueOnce(undefined);
      mockGetCart.mockResolvedValueOnce(emptyCart()); // post-checkout refetch

      const { result } = await renderHook(() => useCart());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(useCartStore.getState().count).toBe(2);

      let ok: boolean | undefined;
      await act(async () => {
        ok = await result.current.checkout();
      });

      expect(ok).toBe(true);
      expect(mockCheckoutOrder).toHaveBeenCalledTimes(1);
      expect(mockGetCart).toHaveBeenCalledTimes(2);
      expect(result.current.cart).toEqual(emptyCart());
      expect(useCartStore.getState().count).toBe(0);
      expect(result.current.error).toBeNull();
    });

    it("on failure: reports the error, returns false, and leaves the cart untouched", async () => {
      const cart = makeCart({}, [makeItem({ quantity: 2 })]);
      mockGetCart.mockResolvedValueOnce(cart);
      mockCheckoutOrder.mockRejectedValueOnce(new Error("out of stock"));

      const { result } = await renderHook(() => useCart());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let ok: boolean | undefined;
      await act(async () => {
        ok = await result.current.checkout();
      });

      expect(ok).toBe(false);
      expect(result.current.error).not.toBeNull();
      // The cart was never cleared/refetched — only a successful checkout does that.
      expect(result.current.cart).toEqual(cart);
      expect(mockGetCart).toHaveBeenCalledTimes(1);
      expect(useCartStore.getState().count).toBe(2);
      expect(result.current.isMutating).toBe(false);
    });
  });
});
