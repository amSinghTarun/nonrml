import { CreditNote } from "@/components/CreditNote";
import { redirectToHomeIfNotLoggedIn } from "../lib/utils";

const CreditNotePage = async () => {
    // await redirectToHomeIfNotLoggedIn();
    // instead it should be like, if logged in then show all the users credit note and if not then ask for search and if logged in then
    // also give a prompt to search for credit note
    return (
        <>
            <section className=" flex h-screen w-screen flex-row text-black justify-center items-center bg-white mb-64 lg:mb-32">
                <CreditNote className="h-[80%] w-[90%] xl:w-[50%]" ></CreditNote> 
            </section>
        </>

    )
}

export default CreditNotePage;