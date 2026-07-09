import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useNearbyEvents } from "@/src/hooks/useNearbyEvents";
import { getNearbyEvents } from "@/api/events";

jest.mock("@/api/events", () => ({
  getNearbyEvents: jest.fn(),
}));

const mockGetNearbyEvents = getNearbyEvents as jest.Mock;

const event = (id: string) => ({
  id,
  title: `evt-${id}`,
  description: null,
  location: null,
  latitude: 9.9,
  longitude: -84.1,
  event_date: "2026-08-15T18:00:00-06:00",
  cover_image_url: null,
  created_by: "u1",
  created_at: "2026-01-01T00:00:00Z",
  participants: [],
  my_participation: null,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useNearbyEvents", () => {
  it("does not fetch when coords is null", async () => {
    const { result } = await renderHook(() => useNearbyEvents(null));

    expect(mockGetNearbyEvents).not.toHaveBeenCalled();
    expect(result.current.events).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("fetches nearby events once coords are available", async () => {
    mockGetNearbyEvents.mockResolvedValue({ items: [event("a"), event("b")], page: 1, limit: 100, total: 2 });

    const { result } = await renderHook(() => useNearbyEvents({ latitude: 9.9, longitude: -84.1 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetNearbyEvents).toHaveBeenCalledWith(9.9, -84.1, 25, 1, 100);
    expect(result.current.events.map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("sets an error when the request fails", async () => {
    mockGetNearbyEvents.mockRejectedValue(new Error("network down"));

    const { result } = await renderHook(() => useNearbyEvents({ latitude: 9.9, longitude: -84.1 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).not.toBeNull();
    expect(result.current.events).toEqual([]);
  });

  it("refetch re-issues the request", async () => {
    mockGetNearbyEvents.mockResolvedValue({ items: [event("a")], page: 1, limit: 100, total: 1 });

    const { result } = await renderHook(() => useNearbyEvents({ latitude: 9.9, longitude: -84.1 }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetNearbyEvents).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.refetch();
    });
    expect(mockGetNearbyEvents).toHaveBeenCalledTimes(2);
  });
});
