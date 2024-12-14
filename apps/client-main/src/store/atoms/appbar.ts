import { isNull } from '@tsparticles/engine';
import { create } from 'zustand';

type appbarUtilOptns = "SIDEBAR" | "CART" | "USER_ACCESSIBILITY" | "" ;

interface AppbarUtilOpenState {
  appbarUtil : appbarUtilOptns,
  setAppbarUtil : (appbarUtils: appbarUtilOptns) => void,
  reset: () => void
}

export const useSetAppbarUtilStore = create<AppbarUtilOpenState>()(
    (set) => ({
      appbarUtil: "",
      setAppbarUtil: (openUtil) =>  set((state) => ({appbarUtil: openUtil})),
      reset: () => set((state) => {
        // console.log("now:", state.appbarUtil, "prev", state.prevAppbar)
        // if(state.prevAppbar == "")
          // return {appbarUtil: "", prevAppbar: null}
        return { appbarUtil: "" }
      })
  })
);