import { create } from 'zustand';

type buyNowObj = {
    [productVariantId: number] : {
        productName: string, 
        productId: number, 
        productSku: string,
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
        setBuyNowItems: (item) =>  set( (state) => { 
            // buynow will only have 1 at max all time, coz 1 can only buy 1 item from buy it now
            for(let itemId of Object.keys(item)){
                if(item[+itemId].quantity <= 0)
                    return { buyNowItems: {} }
            }
            return { buyNowItems: item } 
        })
    })
);