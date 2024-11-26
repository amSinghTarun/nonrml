import { serverClient } from "@/app/_trpc/serverClient";
import { ProductCard, ProductContainer } from "@/components/cards/ProductCard";


const StorePage = async ({ params }: { params: { category: string } }) => {
    const { data: products } = await (await serverClient()).viewer.product.getProducts({categoryName: params.category});
    //console.log(products)
    return (
                <section className="pt-14 flex-col  flex ">
                        <h1 className="flex mt-4 text-black text-2xl lg:text-4xl font-extrabold pl-4 pb-4">
                            {(params.category).replace("_", " ").toUpperCase()}
                        </h1>
                        {/* <main className="ml-2"> */}
                        <ProductContainer>
                            {
                                products.map(products => {
                                    return (
                                    <ProductCard
                                        image={products.productImages[0].image}
                                        name={products.name}
                                        id={products.id}
                                        count={products._count.ProductVariants}
                                        imageAlt={products.name}
                                        price={+products.price}
                                    ></ProductCard>
                                    )
                                })
                            }
                        </ProductContainer> 
                        {/* </main> */}
                </section>
    )
}

export default StorePage;
