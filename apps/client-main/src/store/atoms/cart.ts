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
  removeProduct: (productId: number) => void,
  reset: () => void
}

export const useCartItemStore = create<CartItemState>()(
  persist(
    ( set ) => ({
      cartItems: {},
      setCartItems: (cartItem) =>  {
        set((state) => ({ cartItems: {...state.cartItems, ...cartItem} }) )
      },
      alterQuantity : (productId: number, quantity: number) => {
        set( (state) => ({ cartItems: { ...state.cartItems, [productId]: { ...state.cartItems[productId], quantity: quantity}}}))
      },
      removeProduct: (productId: number) => {
        set( (state) => {
          const cartItems = {...state.cartItems};
          delete cartItems[productId]
          return { cartItems: cartItems };
        });
      },
      reset: () => set((state) => ({ cartItems: {} })),
    }),
    { 
      name: `cart-nonrml`,
      onRehydrateStorage: (state) => (state.reset)
    }
  )
)