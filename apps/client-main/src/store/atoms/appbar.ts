import { atom } from 'recoil';

export const appbarOpenUtil = atom<"SIDEBAR" | "CART" | "USER_ACCESSIBILITY" | "">({
    key: 'cartOpen',
    default: "",
  });
  
  