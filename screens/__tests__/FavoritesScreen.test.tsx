import React from "react";
import { screen, fireEvent, act, waitFor } from "@testing-library/react-native";
import { renderWithProviders } from "@/components/__tests__/test-utils";
import FavoritesScreen from "@/screens/FavoritesScreen";
import { getFavoriteProducts } from "@/api/users";

jest.mock("expo-router", () => {
  const R = require("react");
  return {
    useFocusEffect: (cb: () => void) => {
      (globalThis as any).__favFocusCb = cb;
      R.useEffect(() => cb(), [cb]);
    },
    useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
    usePathname: () => "/favoritos",
    useSegments: () => [],
    useLocalSearchParams: () => ({}),
    Link: ({ children }: { children: React.ReactNode }) => children,
    Stack: { Screen: () => null },
  };
});

jest.mock("@/api/users", () => ({
  getFavoriteProducts: jest.fn(),
}));

const mockGetFav = getFavoriteProducts as jest.Mock;

const favPage = (ids: string[], total: number) => ({
  items: ids.map((id) => ({
    id,
    name: `Fav ${id}`,
    is_active: true,
    base_price: "10.00",
    variants: [],
    store: null,
    category: null,
    description: "",
  })),
  total,
  page: 1,
});

beforeEach(() => jest.clearAllMocks());

describe("FavoritesScreen", () => {
  it("retries the failed page-1 refresh (not the next page) from the inline error banner", async () => {
    // 1. Initial focus load succeeds with one favorite.
    mockGetFav.mockResolvedValueOnce(favPage(["f1"], 5));
    await renderWithProviders(<FavoritesScreen />);
    await waitFor(() => expect(mockGetFav).toHaveBeenCalledTimes(1));

    // 2. A re-focus refresh (page 1) fails, leaving the existing list on screen.
    mockGetFav.mockRejectedValueOnce(new Error("network blip"));
    await act(async () => {
      (globalThis as any).__favFocusCb();
    });

    // The inline (non-empty-list) retry banner appears.
    const retry = await screen.findByText("Reintentar");

    // 3. Pressing retry must re-request page 1 — not page + 1.
    mockGetFav.mockClear();
    mockGetFav.mockResolvedValueOnce(favPage(["f1"], 5));
    await act(async () => {
      fireEvent.press(retry);
    });

    await waitFor(() => expect(mockGetFav).toHaveBeenCalledWith(1, 10));
  });
});
