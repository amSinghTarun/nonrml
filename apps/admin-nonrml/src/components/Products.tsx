import React from "react"
import { RouterOutput, trpc } from "@/app/_trpc/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UseTRPCQueryResult } from "@trpc/react-query/shared"
import { useRouter } from "next/navigation"

type Products = UseTRPCQueryResult<RouterOutput["viewer"]["product"]["getAdminProducts"], unknown>

export const Products = ({products}: {products: Products}) => {

  const router = useRouter();
  console.log(products.data?.data.length)
  const manageVisibility = trpc.viewer.product.editProduct.useMutation();
  const allSizeCharts = trpc.viewer.sizeChart.getSizeChart.useQuery({type: "DISPLAY_NAME"});
  const addSizeChartToProduct = trpc.viewer.product.editProduct.useMutation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Id</TableHead>
          <TableHead>Public</TableHead>
          <TableHead>latest</TableHead>
          <TableHead>exclusive</TableHead>
          <TableHead>Sold out</TableHead>
          <TableHead className="bg-orange-400 text-white cursor-pointer">Sku</TableHead>
          <TableHead>Avl count</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Visit Count</TableHead>
          <TableHead>Size Chart</TableHead>
        </TableRow>
      </TableHeader>
      
      <TableBody>
        { products.data?.data.length && products.data?.data?.map( product => (
            <TableRow key={product.id}>
              <TableCell>{product.id}</TableCell>
              {/* <TableCell className={`${product.exclusive && "bg-green-200"}`}>{product.name}</TableCell> */}
              <TableCell>
                <button onClick={async () => {await manageVisibility.mutateAsync({productId: product.id, public: !product?.public}); products.refetch()}} className=" text-sm p-1 bg-stone-400 cursor-pointer hover:bg-stone-300 rounded-sm">
                  {`${product.public ? "HIDE" : "SHOW"}`}
                </button>
              </TableCell>
              <TableCell>
                <button onClick={async () => {await manageVisibility.mutateAsync({productId: product.id, latest: !product?.latest}); products.refetch()}} className=" text-sm p-1 bg-stone-400 cursor-pointer hover:bg-stone-300 rounded-sm">
                  {`${product.latest ? "UNMARK" : "MARK"}`}
                </button>
              </TableCell>
              <TableCell>
                <button onClick={async () => {await manageVisibility.mutateAsync({productId: product.id, exclusive: !product?.exclusive}); products.refetch()}} className=" text-sm p-1 bg-stone-400 cursor-pointer hover:bg-stone-300 rounded-sm">
                  {`${product.exclusive ? "REMOVE" : "MAKE"}`}
                </button>
              </TableCell>
              <TableCell>{`${product.soldOut}`}</TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TableCell className="hover:bg-orange-400 hover:text-white cursor-pointer">{product.sku}</TableCell>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-stone-700 text-white">
                  <DropdownMenuItem onClick={() => router.push(`/products/${product.sku}`)}>View Details</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/inventory?productSku=${product.sku}`)}>View Inventory</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <TableCell>{product._count.ProductVariants}</TableCell>
              <TableCell>{+product.price}</TableCell>
              <TableCell>{product.visitedCount}</TableCell>
              <TableCell>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='p-1 rounded-md bg-stone-400 hover:bg-stone-200' onClick={() => {}}>{product.sizeChartId ?? "+ SizeChart"}</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-stone-700 text-white">{
                  allSizeCharts.data?.data.map( sizeChart => (
                    <DropdownMenuItem key={sizeChart.id} onClick={() => {addSizeChartToProduct.mutate({sizeChartId: sizeChart.id, productId: product.id})}}>{sizeChart.name}</DropdownMenuItem>  
                  )
                )
              }
                { product.sizeChartId && <DropdownMenuItem onClick={() => {addSizeChartToProduct.mutate({sizeChartId: -1, productId: product.id})}}>REMOVE</DropdownMenuItem>  }
                </DropdownMenuContent>
              </DropdownMenu>
              </TableCell>
          </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
} 