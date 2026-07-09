import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useLocation } from "@/src/hooks/useLocation";
import * as Location from "expo-location";

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  PermissionStatus: { GRANTED: "granted", DENIED: "denied", UNDETERMINED: "undetermined" },
  Accuracy: { Balanced: 3 },
}));

const mockRequestPermission = Location.requestForegroundPermissionsAsync as jest.Mock;
const mockGetPosition = Location.getCurrentPositionAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useLocation", () => {
  it("requests permission and coords on mount by default", async () => {
    mockRequestPermission.mockResolvedValue({ status: "granted" });
    mockGetPosition.mockResolvedValue({ coords: { latitude: 9.93, longitude: -84.08 } });

    const { result } = await renderHook(() => useLocation());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
    expect(result.current.coords).toEqual({ latitude: 9.93, longitude: -84.08 });
    expect(result.current.permissionStatus).toBe("granted");
  });

  it("does not request permission on mount when autoRequest is false", async () => {
    const { result } = await renderHook(() => useLocation(false));

    expect(result.current.isLoading).toBe(false);
    expect(mockRequestPermission).not.toHaveBeenCalled();
    expect(result.current.coords).toBeNull();
  });

  it("returns the resolved coords from requestPermission so callers don't need to wait for a re-render", async () => {
    mockRequestPermission.mockResolvedValue({ status: "granted" });
    mockGetPosition.mockResolvedValue({ coords: { latitude: 1, longitude: 2 } });

    const { result } = await renderHook(() => useLocation(false));

    let returned: { latitude: number; longitude: number } | null = null;
    await act(async () => {
      returned = await result.current.requestPermission();
    });

    expect(returned).toEqual({ latitude: 1, longitude: 2 });
  });

  it("sets an error and returns null when permission is denied", async () => {
    mockRequestPermission.mockResolvedValue({ status: "denied" });

    const { result } = await renderHook(() => useLocation(false));

    let returned: unknown = "unset";
    await act(async () => {
      returned = await result.current.requestPermission();
    });

    expect(returned).toBeNull();
    expect(result.current.permissionStatus).toBe("denied");
    expect(mockGetPosition).not.toHaveBeenCalled();
  });
});
