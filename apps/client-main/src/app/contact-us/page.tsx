import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

const mail = "testMail231@gmail.com";

const ContactUsPage = () => {
    return (
        <section className="z-30 inset-0 h-screen w-screen flex break justify-center items-center">
            <article className="backdrop-blur-3xl h-[80%] bg-white/10 w-[90%] flex flex-col text-center p-4  rounded-xl">
                <h1 className="flex text-black justify-center place-items-end basis-1/3 text-4xl pb-5 ">
                    CONTACT US !
                </h1>
                <div className=" pt-6 justify-center text-black">
                    <p>
                        {`To contact customer support for any product information or queries regarding an order, please reach out to us with the below email address: `}
                    </p>
                    <p className="hover:cursor-pointer text-rose-400">
                        {mail}
                    </p>
                </div>
            </article>
        </section>
    )
}

export default ContactUsPage;
