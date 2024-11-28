// import { atom } from 'recoil';

// export const buyNowItems = atom<{
//     [productVariantId:  number] : {
//         productName: string, 
//         productId: number, 
//         productImage: string, 
//         quantity: number, 
//         size: string, 
//         variantId: number,
//         price: number
//     }
// }>({
//     key: 'buyNowItems',
//     default: {}
// })


import { create } from 'zustand';

type buyNowObj = {
    [productVariantId: number] : {
        productName: string, 
        productId: number, 
        productImage: string, 
        quantity: number, 
        size: string, 
        variantId: number,
        price: number
    }
}

interface BuyNowItemsState {
    buyNowItems: buyNowObj,
    setBuyNowItems : (butNowItems: buyNowObj) => void 
}

export const useBuyNowItemsStore = create<BuyNowItemsState>()(
    (set) => ({
      buyNowItems: {},
      setBuyNowItems: (item) =>  set((state) => ({buyNowItems: {...state.buyNowItems, item}}))
  })
);