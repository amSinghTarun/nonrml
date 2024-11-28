import { atom } from 'recoil';

export const appbarOpenUtil = atom<"SIDEBAR" | "CART" | "USER_ACCESSIBILITY" | "">({
    key: 'cartOpen',
    default: "",
  });
  
  
import { create } from 'zustand';

type appbarUtilOptns = "SIDEBAR" | "CART" | "USER_ACCESSIBILITY" | ""

interface AppbarUtilOpenState {
  appbarUtil : appbarUtilOptns,
  setAppbarUtil : (appbarUtils: appbarUtilOptns) => void,
  reset: () => void
}

export const useSetAppbarUtilStore = create<AppbarUtilOpenState>()(
    (set) => ({
      appbarUtil: "",
      setAppbarUtil: (openUtil) =>  set((state) => ({appbarUtil: openUtil})),
      reset: () => set(() => ({appbarUtil: ""}))
  })
)