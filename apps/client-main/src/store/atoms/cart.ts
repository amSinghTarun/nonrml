// import { atom } from 'recoil';
// import { localStorageEffect } from '../helpers';
// import { getSession } from '@nonrml/configs';

// export const cartItems = atom<{
//   [produtcVariantId: number] : {
//     productName: string, 
//     productId: number, 
//     productImage: string, 
//     quantity: number, 
//     size: string, 
//     price: number,
//     variantId: number
//   }
// }>({
//     key: 'cartItems',
//     default: {},
//     effects: [
//       localStorageEffect("cartItems")
//     ]
// });


import { createStore } from 'zustand';
import { persist } from "zustand/middleware"

type cartItem = {
  [produtcVariantId: number] : {
    productName: string, 
    productId: number, 
    productImage: string, 
    quantity: number, 
    size: string, 
    price: number,
    variantId: number
  }
}

interface CartItemState {
  cartItems : cartItem,
  setCartItems : (cartItem: cartItem) => void 
}

export const useCartItemStore = createStore<CartItemState>()(
  persist(
    (set) => ({
      cartItems: {},
      setCartItems: (cartItem) =>  set((state) => ({...state.cartItems, cartItems: cartItem}))
    }),
    {name: `cart-nonrml`},
  )
)
// useCartItemStore.getState().setCartItems({})