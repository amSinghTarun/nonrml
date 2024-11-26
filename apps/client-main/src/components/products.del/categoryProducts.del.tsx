import { ProductCard, ProductContainer } from "../cards/ProductCard"
import { RouterOutput } from "@/app/_trpc/client";

type productsTRPCFncOutput = RouterOutput["viewer"]["product"]["getProducts"]["data"][number] // [number] is added to extract type of particular json
interface ExtendedProduct extends productsTRPCFncOutput {
    productInventoryMap?: {[x:string]: any}[],
    _count?: {[x:string]: any},
    productImages?: {[x:string]: any}[]
}

interface CategoryProductsProps {
    products: ExtendedProduct[]; // Extended product type array
}

const CategoryProducts : React.FC<CategoryProductsProps> = async ({products}) => {
    return (
        <ProductContainer>
        {
            products.map(products => {
                return (
                  <ProductCard
                    image={products.productImages![0].image}
                    name={products.name}
                    id={products.id}
                    count={products._count!.productInventory}
                    imageAlt={products.name}
                    price={+products.finalPrice}
                  ></ProductCard>
                )
            })
        }
      </ProductContainer> 
    )
}

export default CategoryProducts;
