import { serverClient } from "@/app/_trpc/serverClient";
import { redirectToHomeIfNotLoggedIn } from "@/app/lib/utils";
import { Returns } from "@/components/Returns";

const ReturnOrders = async ({params}: {params: {orderId: string}}) => {
    await redirectToHomeIfNotLoggedIn();
    const userReturns = await (await serverClient()).viewer.return.getReturnOrders({orderId: +(await params).orderId}) ;

    return (
        <section className="z-30 pt-24 flex flex-row w-screen h-screen text-black justify-center">
            <Returns className="h-[95%] w-[90%] lg:w-[50%]" returnOrders={userReturns.data}/> 
        </section>
    )
}

export default ReturnOrders;