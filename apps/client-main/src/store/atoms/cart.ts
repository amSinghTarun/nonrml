import { create } from 'zustand';
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

export const useCartItemStore = create<CartItemState>()(
  persist(
    ( set ) => ({
      cartItems: {},
      setCartItems: (cartItem) =>  {
        set((state) => {
          return { cartItems: {...state.cartItems, ...cartItem} }
        })
      }
    }),
    {name: `cart-nonrml`}
  )
)