import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useSearch } from "@/src/hooks/useSearch";
import { search, autocomplete } from "@/api/search";
import type { SearchScope } from "@/types/search";

jest.mock("@/api/search", () => ({
  search: jest.fn(),
  autocomplete: jest.fn(),
}));

const mockSearch = search as jest.Mock;
const mockAutocomplete = autocomplete as jest.Mock;

// Minimal product-shaped row; only `id` matters for the dedup assertions.
const prod = (id: string) => ({ id, name: `p-${id}` });

const productsPage = (ids: string[], page: number, total: number) => ({
  scope: "products",
  items: ids.map(prod),
  page,
  limit: 20,
  total,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockAutocomplete.mockResolvedValue({ scope: "products", items: [] });
});

describe("useSearch", () => {
  it("syncs scope when the caller-provided scope changes", async () => {
    const { result, rerender } = await renderHook(
      ({ scope }: { scope: SearchScope }) => useSearch(scope),
      { initialProps: { scope: "all" as SearchScope } }
    );

    expect(result.current.scope).toBe("all");

    await rerender({ scope: "products" as SearchScope });

    await waitFor(() => expect(result.current.scope).toBe("products"));
  });

  it("dedups by id when appending a page that overlaps the previous one", async () => {
    mockSearch.mockResolvedValueOnce(productsPage(["a", "b"], 1, 4));
    const { result } = await renderHook(() => useSearch("products"));

    await act(async () => {
      await result.current.performSearch("q", "products", 1);
    });
    expect(result.current.results?.scope).toBe("products");
    expect((result.current.results as any).items.map((i: any) => i.id)).toEqual(["a", "b"]);

    // Page 2 overlaps "b" (e.g. a page fetched twice) — it must not duplicate.
    mockSearch.mockResolvedValueOnce(productsPage(["b", "c"], 2, 4));
    await act(async () => {
      await result.current.performSearch("q", "products", 2);
    });

    expect((result.current.results as any).items.map((i: any) => i.id)).toEqual(["a", "b", "c"]);
  });
});
