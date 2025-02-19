import { create } from 'zustand';
import { persist } from "zustand/middleware"

type cartItem = {
  [produtcVariantId: number] : {
    productName: string, 
    productSku: string, 
    productId: number,
    productImage: string, 
    quantity: number, 
    size: string, 
    price: number,
    variantId: number,
    expireTime?: number
  }
}

interface CartItemState {
  cartItems : cartItem,
  setCartItems : (cartItem: cartItem) => void,
  alterQuantity: (productVariantId: number, quantity: number) => void,
  removeProduct: (productVariantId: number) => void,
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
            cartItemsToAdd[+cartItemId].expireTime = Date.now();
            if( cartItemsToAdd[+cartItemId].quantity <= 0 ) {
              delete finalCartItem[+cartItemId];
            }
          }
          return { cartItems: finalCartItem };
        })
      },
      alterQuantity : (productVariantId: number, quantity: number) => {
        set( (state) => ({ cartItems: { ...state.cartItems, [productVariantId]: { ...state.cartItems[productVariantId], quantity: quantity}}}))
      },
      removeProduct: (productVariantId: number) => {
        set( (state) => {
          const cartItems = {...state.cartItems};
          delete cartItems[productVariantId]
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