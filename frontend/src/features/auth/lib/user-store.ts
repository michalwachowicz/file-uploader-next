import { UserResponse } from "@file-uploader/shared";
import { create } from "zustand";

interface UserStore {
  user: UserResponse | null;
  actions: {
    setUser: (user: UserResponse) => void;
    clearUser: () => void;
  };
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  actions: {
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
  },
}));

export const useUser = () => useUserStore((state) => state.user);
export const useUserActions = () => useUserStore((state) => state.actions);
