import { CreditNote } from "@/components/CreditNote";
import { redirectToHomeIfNotLoggedIn } from "../lib/utils";

const CreditNotePage = async () => {
    await redirectToHomeIfNotLoggedIn();
    return (
        <>
            <section className=" flex h-screen w-screen flex-row text-black justify-center items-center ">
                <CreditNote className="h-[80%] w-[90%] xl:w-[50%]" ></CreditNote> 
            </section>
        </>

    )
}

export default CreditNotePage;