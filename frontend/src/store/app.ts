import { create } from 'zustand';

interface AppState {
  userLat: number | null;
  userLng: number | null;
  selectedRoadId: string | null;
  isOffline: boolean;
  setLocation: (lat: number, lng: number) => void;
  setSelectedRoad: (id: string | null) => void;
  setOffline: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userLat: null,
  userLng: null,
  selectedRoadId: null,
  isOffline: !navigator.onLine,
  setLocation: (lat, lng) => set({ userLat: lat, userLng: lng }),
  setSelectedRoad: (id) => set({ selectedRoadId: id }),
  setOffline: (v) => set({ isOffline: v }),
}));

// Listen for online/offline events
window.addEventListener('online', () => useAppStore.getState().setOffline(false));
window.addEventListener('offline', () => useAppStore.getState().setOffline(true));
