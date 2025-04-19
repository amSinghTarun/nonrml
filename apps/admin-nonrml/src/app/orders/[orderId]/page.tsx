import OrderContainer from "@/components/order/OrderContainer";

const OrderPage = async ({ params }: { params: Promise<{ orderId: string }> }) => {
    const { orderId } = await params;

    return (
        <section className="flex flex-col border-t border-black w-screen h-screen text-black">
            <h1 className="text-left py-5 px-5 bg-stone-700 font-bold text-white">Order: {orderId}</h1>
            <OrderContainer orderId={orderId} />
        </section>
    );
};

export default OrderPage;