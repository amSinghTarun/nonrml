import { TrackOrder } from "@/components/TrackOrder";

const TrackOrderPage = async () => {
    return (
        <>
            <section className=" flex h-screen w-screen flex-row text-black justify-center items-center ">
                <TrackOrder className="h-[80%] w-[90%] xl:w-[50%]" ></TrackOrder> 
            </section>
        </>

    )
}

export default TrackOrderPage;