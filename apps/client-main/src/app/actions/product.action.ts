"use server"

import { getSession } from "@nonrml/configs";
import { serverClient } from "../_trpc/serverClient"
import { RouterOutput } from "@/app/_trpc/client";

type OrderProduct = RouterOutput["viewer"]["orders"]["getUserOrder"]["data"];

export const getHomepageProducts = async () => {
    let {data : products} = await (await serverClient()).viewer.product.getProducts({availability: true});
    let homePageProducts = products.map((product) => {
        return {
            title: product.name,
            link: "/",
            thumbnail: product.productImages![0].image
        }
    })
    return homePageProducts ;
}

export const getExchangeProductSizes = async ( exchangeProducts: NonNullable<OrderProduct>["orderProducts"] ) => {
    // const session = await getSession();
    // if (!session?.user.id) throw new Error("UNAUTHORISED ACTION, you must first login");
    const productIdsJson : { [productId: number] : 1 }= {};
    const productIds : number[] = []
    for(let exchangeProduct of exchangeProducts){
        if(!productIdsJson[exchangeProduct.productVariant.productId]){
            productIds.push(exchangeProduct.productVariant.productId);
        }
        productIdsJson[exchangeProduct.productVariant.productId] = 1;
    }
    let { data } = await (await serverClient()).viewer.product.getProductSizes(productIds);
    return data;
};