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
  setCartItems : (cartItem: cartItem) => void,
  alterQuantity: (productId: number, quantity: number) => void,
  removeProduct: (productId: number) => void
}

export const useCartItemStore = create<CartItemState>()(
  persist(
    ( set, get ) => ({
      cartItems: {},
      setCartItems: (cartItem) =>  {
        set((state) => {
          return { cartItems: {...state.cartItems, ...cartItem} }
        })
      },
      alterQuantity : (productId: number, quantity: number) => {
        set( (state) => {
          return { cartItems: { ...state.cartItems, [productId]: { ...state.cartItems[productId], quantity: quantity}}}
        })
      },
      removeProduct: (productId: number) => {
        set( (state) => {
          const cartItems = {...state.cartItems};
          delete cartItems[productId]
          return { cartItems: cartItems};
        })
      }
    }),
    {name: `cart-nonrml`}
  )
)