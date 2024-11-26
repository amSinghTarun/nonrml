import { atom } from 'recoil';
import { localStorageEffect } from '../helpers';

export const cartItems = atom<{
  [produtcVariantId: number] : {
    productName: string, 
    productId: number, 
    productImage: string, 
    quantity: number, 
    size: string, 
    price: number,
    variantId: number
  }
}>({
    key: 'cartItems',
    default: {},
    effects: [
      localStorageEffect("cartItems")
    ]
})
