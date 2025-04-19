import PaymentsDashboard from "@/components/Payments";

const PaymentsPage = () => {
    return (
        <>
            <h1 className="text-left py-5 px-5 bg-stone-700   font-bold text-white">Payments</h1>
            <section className="  flex flex-row border-t bborder-black w-screen h-screen text-black justify-center ">
                <PaymentsDashboard></PaymentsDashboard>
            </section>
        </>
    )
}

export default PaymentsPage