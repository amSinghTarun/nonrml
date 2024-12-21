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
      setCartItems: (cartItemsToAdd) =>  {
        console.log(cartItemsToAdd);
        set((state) => { 
          let finalCartItem ={ ...state.cartItems, ...cartItemsToAdd};
          for(let cartItemId of Object.keys(cartItemsToAdd)) {
            if( cartItemsToAdd[+cartItemId].quantity <= 0 ) {
              delete finalCartItem[+cartItemId];
            }
          }
          return { cartItems: finalCartItem };
        })
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
      name: `cart-nonrml`
    }
  )
)