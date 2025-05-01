import { serverClient } from "@/app/_trpc/serverClient";
import { redirectToHomeIfNotLoggedIn } from "@/app/lib/utils";
import { Exchanges } from "@/components/Exchanges";

const ExchangeOrders = async ({params}: {params: Promise<{orderId: string}>}) => {
    await redirectToHomeIfNotLoggedIn();
    const userExchanges = await (await serverClient()).viewer.replacement.getReplacement({orderId: (await params).orderId});
    return (
        <section className="pt-14 pb-5 z-30 flex-col min-h-screen h-auto w-screen overflow-scroll flex bg-white mb-64 lg:mb-32">
            <Exchanges exchangeOrders={userExchanges.data}/> 
        </section>
    )
}

export default ExchangeOrders;