import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useProducts } from "@/src/hooks/useProducts";
import { getProducts } from "@/api/products";

jest.mock("@/api/products", () => ({
  getProducts: jest.fn(),
}));

const mockGetProducts = getProducts as jest.Mock;

// Backend-product-shaped row; the hook maps it to a UI product keyed by `id`.
const backendProduct = (id: string) => ({
  id,
  name: `p-${id}`,
  is_active: true,
  base_price: "10.00",
  variants: [],
  store: null,
  category: null,
  description: "",
});

const page = (ids: string[], total: number) => ({
  items: ids.map(backendProduct),
  page: 1,
  limit: 20,
  total,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useProducts", () => {
  it("ignores a stale response that resolves after a newer request", async () => {
    // Hand out a controllable promise per call so we can resolve out of order.
    const resolvers: ((v: unknown) => void)[] = [];
    mockGetProducts.mockImplementation(() => new Promise((res) => resolvers.push(res)));

    const { result, rerender } = await renderHook(
      ({ search }: { search?: string }) => useProducts({ search }),
      { initialProps: { search: undefined as string | undefined } }
    );

    // Wait for the mount fetch (request A) to have been issued.
    await waitFor(() => expect(resolvers.length).toBe(1));

    // Change filters → resets the list and issues request B.
    await rerender({ search: "chair" });
    await waitFor(() => expect(resolvers.length).toBe(2));

    // Resolve the NEWER request B first, then the stale request A.
    await act(async () => {
      resolvers[1](page(["c"], 1)); // request B — filtered result
      resolvers[0](page(["a", "b"], 2)); // request A — stale, must be ignored
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Only request B's result survives; the stale A did not append a/b.
    expect(result.current.products.map((p) => p.id)).toEqual(["c"]);
  });
});
