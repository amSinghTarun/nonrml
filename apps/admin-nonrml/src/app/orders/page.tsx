"use client"
import { Orders } from "@/components/Orders";
import { trpc } from '@/app/_trpc/client';
import { DatePicker } from "@/components/ui/date-picker";
import { OrderStatus } from "@/components/OrderStatus";
import { useState } from "react";
import { useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";


interface FilterState {
  date?: Date;
  status?: "PENDING" | "IN_TRANSIT" | "ACCEPTED" | "SHIPPED" | "DELIVERED" | "PAYMENT_FAILED" | "CANCELED" | "CANCELED_ADMIN";
  orderId: number;
  submittedOrderId: number;
}

const initialFilterState: FilterState = {
  date: undefined,
  status: undefined,
  orderId: 0,
  submittedOrderId: 0
};

const OrdersPage = () => {
  const userIdParam = useSearchParams().get('userId');
  const returnParam = useSearchParams().get('returns');

  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [page, setPage] = useState(1); // Track current page

  console.log("ENTERNIG THE getAllOrders")
  // const orders = trpc.viewer.orders.getAllOrders.useQuery({
  //   page: (!filters.date && !filters.status && !filters.submittedOrderId) ? page : undefined,
  //   ordersDate: filters.date,
  //   orderStatus: filters.status,
  //   userId: userIdParam ? +userIdParam : undefined,
  //   returns: returnParam ? true : undefined,
  //   orderId: filters.submittedOrderId ? filters.submittedOrderId : undefined
  // });
  console.log("Done with the getAllOrders")
  // console.log(orders, orders.status, orders.data, orders.error)

  const updateFilter = (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset page when filters change
  };

  const clearFilters = () => {
    setFilters(initialFilterState);
    setPage(1);
  };

  const handleSubmitOrderId = () => {
    updateFilter('submittedOrderId', filters.orderId);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitOrderId();
    }
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  // const handleNextPage = () => {
  //   if (orders.data && orders.data.data.length > 0) setPage(prev => prev + 1);
  // };

  return (
    <section className="flex flex-col w-screen h-screen text-black">
      <h1 className="text-left p-5 bg-stone-700 font-bold text-white">
        Orders {userIdParam && ` of user with Id ${userIdParam}`}
      </h1>

      <div className="flex flex-row items-center justify-start p-5 bg-stone-700 flex-wrap gap-2">
        <DatePicker onSelect={(date) => updateFilter('date', date)} />
        <OrderStatus onClick={(status) => updateFilter('status', status)} />
        <div className="flex space-x-2">
          <div className="flex bg-white rounded-md">
            <Input
              placeholder="Order ID"
              value={filters.orderId}
              onChange={(e) => updateFilter('orderId', +e.target.value)}
              onKeyDown={handleKeyPress}
              className="bg-white rounded-r-none border-0"
            />
            <Button 
              onClick={handleSubmitOrderId}
              variant={"secondary"}
              className="flex bg-white items-center gap-2 rounded-l-none"
            >
              <Search size={16} />
            </Button>
          </div>
          <Button 
            onClick={clearFilters}
            variant="secondary"
            className="flex items-center gap-2"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* {orders.status == "success" && <Orders orders={orders} />} */}
{/* 
      {orders.isLoading && <div>Loading...</div>}
      {orders.error && <div>Error: {orders.error.message}</div>} */}

      {/* Pagination */}
      {/* <div className="flex justify-center items-center mt-4 gap-2">
        <Button onClick={handlePrevPage} disabled={page === 1} variant="secondary" className="flex items-center gap-1">
          <ChevronLeft size={16} /> Prev
        </Button>
        <span>Page {page}</span>
        <Button onClick={handleNextPage} disabled={orders.data?.data.length === 0} variant="secondary" className="flex items-center gap-1">
          Next <ChevronRight size={16} />
        </Button>
      </div> */}
    </section>
  );
};

export default OrdersPage;
