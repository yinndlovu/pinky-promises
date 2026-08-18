import { create } from "zustand";

export type HomeState = {
  partner: any | null;
  unseenInteractions: any[];
  upcomingSpecialDate: any | null;
  counts: any | null;
  notifications: any[];
  recentActivities: any[];
  partnerStatus: any | null;
  partnerMood: any | null;
  resolutions: any[];
  hydrated: boolean;
};

type HomeActions = {
  hydrate: (data: Omit<HomeState, "hydrated">) => void;
  reset: () => void;
};

const emptyState: HomeState = {
  partner: null,
  unseenInteractions: [],
  upcomingSpecialDate: null,
  counts: null,
  notifications: [],
  recentActivities: [],
  partnerStatus: null,
  partnerMood: null,
  resolutions: [],
  hydrated: false,
};

export const useHomeStore = create<HomeState & HomeActions>((set) => ({
  ...emptyState,

  hydrate: (data) => set({ ...data, hydrated: true }),

  reset: () => set({ ...emptyState }),
}));
