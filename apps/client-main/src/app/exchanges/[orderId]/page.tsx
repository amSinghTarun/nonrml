import { serverClient } from "@/app/_trpc/serverClient";
import { redirectToHomeIfNotLoggedIn } from "@/app/lib/utils";
import { Exchanges } from "@/components/Exchanges";

const ExchangeOrders = async ({params}: {params: {orderId: string}}) => {
    await redirectToHomeIfNotLoggedIn();
    const userExchanges = await (await serverClient()).viewer.replacement.getReplacement({orderId: +(await params).orderId});
    return (
        <section className="z-30 pt-24 flex flex-row w-screen h-screen text-black justify-center">
            <Exchanges className="h-[95%] w-[90%] lg:w-[50%]" exchangeOrders={userExchanges.data}/> 
        </section>
    )
}

export default ExchangeOrders;