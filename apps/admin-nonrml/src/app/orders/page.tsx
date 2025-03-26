"use client"
import { Orders } from "@/components/Orders";
import { trpc } from '@/app/_trpc/client';
import { DatePicker } from "@/components/ui/date-picker";
import { OrderStatus } from "@/components/OrderStatus";
import { useState } from "react";
import { useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface FilterState {
  date?: Date;
  status?: any;
  orderId: string;
  submittedOrderId: string;
}

const initialFilterState: FilterState = {
  date: undefined,
  status: undefined,
  orderId: "",
  submittedOrderId: ""
};

export default () => {
  const userIdParam = useSearchParams().get('userId');
  const returnParam = useSearchParams().get('returns');
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  console.log(filters.date?.getTimezoneOffset());

  const orders = trpc.viewer.orders.getAllOrders.useQuery({
    page: (!filters.date && !filters.status && !filters.submittedOrderId) ? 1 : undefined,
    ordersDate: filters.date,
    orderStatus: filters.status,
    userId: userIdParam ? +userIdParam : undefined,
    returns: returnParam ? true : undefined,
    orderId: filters.submittedOrderId ? filters.submittedOrderId : undefined
  }, {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const updateFilter = (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilterState);
  };

  const handleSubmitOrderId = () => {
    updateFilter('submittedOrderId', filters.orderId);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitOrderId();
    }
  };

  return (
    <>
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
                    onChange={(e) => updateFilter('orderId', e.target.value)}
                    onKeyDown={handleKeyPress}
                    className=" bg-white rounded-r-none border-0"
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
        <Orders orders={orders} />
        {orders.isLoading && <div>Loading...</div>}
        {orders.error && <div>Error: {orders.error.message}</div>}
      </section>
    </>
  );
}