/**
 * Lightweight connectivity store.
 * The axios interceptor writes `false` on network errors and `true` on
 * successful responses, so any screen can subscribe to the offline state
 * without pulling in @react-native-community/netinfo.
 */
import { create } from "zustand";

interface ConnectivityState {
  isOnline: boolean;
  setOnline: (v: boolean) => void;
}

export const useConnectivityStore = create<ConnectivityState>((set) => ({
  isOnline: true,
  setOnline: (v) => set({ isOnline: v }),
}));
