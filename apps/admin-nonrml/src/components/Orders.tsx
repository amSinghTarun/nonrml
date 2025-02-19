import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RouterOutput } from "@/app/_trpc/client"
import { UseTRPCQueryResult } from "@trpc/react-query/shared"
import { redirect } from "next/navigation"
import { useRouter} from "next/navigation"

type Orders = UseTRPCQueryResult<RouterOutput["viewer"]["orders"]["getAllOrders"], unknown>

export const Orders = ({orders}:{orders: Orders}) => {
  const router = useRouter();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="bg-orange-300 text-white cursor-pointer">Id</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Credit Utilised</TableHead>
          <TableHead>User Id</TableHead>
          <TableHead>Shipment</TableHead>
          <TableHead>Delivery Date</TableHead>
          <TableHead>Order Status</TableHead>
          <TableHead>Product Count</TableHead>
          <TableHead>Ordered on</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {
          orders.data?.data.map( order => (
            <TableRow>
              <TableCell className="font-medium cursor-pointer hover:bg-orange-400" onClick={ () => { redirect(`/orders/${order.id}`) }}>{order.id}</TableCell>
              <TableCell className="font-medium">{+order.totalAmount}</TableCell>
              <TableCell className="font-medium">{order.creditUtilised}</TableCell>
              <TableCell className="font-medium">{order.userId}</TableCell>
              <TableCell className="font-medium">{order.shipmentId}</TableCell>
              <TableCell className="font-medium">{order.deliveryDate && new Date(Number(order.deliveryDate)).toDateString()}</TableCell>
              <TableCell className="font-medium">{order.orderStatus}</TableCell>
              <TableCell className="font-medium">{order.productCount}</TableCell>
              <TableCell className="font-medium">{order.createdAt.toDateString()}</TableCell>
            </TableRow>
          ))
        }
      </TableBody>

    </Table>
  )
} 