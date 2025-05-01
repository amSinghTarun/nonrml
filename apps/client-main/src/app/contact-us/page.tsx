const mail = "info@nonorml.com";

const ContactUsPage = () => {
    return (
        <section className=" flex h-screen w-screen flex-row text-black justify-center items-center bg-white mb-64 lg:mb-32">
            <article className="h-[80%] w-[90%] flex flex-col text-center">
                <h1 className="flex text-black justify-center place-items-end basis-1/3 text-lg font-bold ">
                    CONTACT US !
                </h1>
                <div className=" pt-6 text-xs justify-center text-black">
                    <p>
                        {`To contact customer support for any product information or queries regarding an order, please reach out to us with the below email address: `}
                    </p>
                    <p className="cursor-pointer text-rose-400">
                        {mail}
                    </p>
                </div>
            </article>
        </section>
    )
}

export default ContactUsPage;
