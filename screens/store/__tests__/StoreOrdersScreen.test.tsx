import React from "react";
import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "@/components/__tests__/test-utils";
import StoreOrdersScreen from "@/screens/store/StoreOrdersScreen";
import { getStoreOrders, getStoreSalesSummary } from "@/api/orders";

jest.mock("expo-router", () => ({
  useFocusEffect: (cb: () => void) => {
    const R = require("react");
    R.useEffect(() => cb(), []);
  },
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ storeId: "store-1" }),
  Stack: { Screen: () => null },
}));

jest.mock("@/api/orders", () => ({
  getStoreOrders: jest.fn(),
  getStoreSalesSummary: jest.fn(),
  updateOrderStatus: jest.fn(),
}));

const mockGetStoreOrders = getStoreOrders as jest.Mock;
const mockGetSummary = getStoreSalesSummary as jest.Mock;

const order = {
  id: "abcdef12-0000-0000-0000-000000000000",
  main_order_id: "m1",
  store_id: "store-1",
  seller_status: "pending",
  subtotal_amount: 0,
  created_at: "2024-01-01T00:00:00Z",
  items: [],
};

beforeEach(() => jest.clearAllMocks());

describe("StoreOrdersScreen", () => {
  it("still shows the orders list when the sales summary request fails", async () => {
    // The summary endpoint is down, but the orders endpoint works.
    mockGetSummary.mockRejectedValueOnce(new Error("summary down"));
    mockGetStoreOrders.mockResolvedValueOnce({ items: [order], total: 1, page: 1, limit: 15 });

    await renderWithProviders(<StoreOrdersScreen />);

    // The order renders (the summary failure did not abort the orders load).
    expect(await screen.findByText(/Pedido #ABCDEF12/)).toBeTruthy();
  });
});
