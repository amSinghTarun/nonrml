import { serverClient } from "@/app/_trpc/serverClient";
import { redirectToHomeIfNotLoggedIn } from "@/app/lib/utils";
import { Returns } from "@/components/Returns";

const ReturnOrders = async ({params}: {params: {orderId: string}}) => {
    await redirectToHomeIfNotLoggedIn();
    const userReturns = await (await serverClient()).viewer.return.getReturnOrders({orderId: (await params).orderId}) ;

    return (
        <section className="pt-14 pb-5 z-30 flex-col min-h-screen h-auto w-screen overflow-scroll flex bg-white mb-64 lg:mb-32">
            <Returns returnOrders={userReturns.data}/> 
        </section>
    )
}

export default ReturnOrders;