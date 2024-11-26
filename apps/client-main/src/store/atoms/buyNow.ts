import { atom } from 'recoil';

export const buyNowItems = atom<{
    [productVariantId:  number] : {
        productName: string, 
        productId: number, 
        productImage: string, 
        quantity: number, 
        size: string, 
        variantId: number,
        price: number
    }
}>({
    key: 'buyNowItems',
    default: {}
})
