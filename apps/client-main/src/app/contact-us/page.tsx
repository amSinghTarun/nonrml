import React from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - NoNRML | Customer Support & Inquiries',
  description: 'Get in touch with NoNRML for product information, order queries, customer support, or general inquiries. We\'re here to help with your streetwear shopping experience. Email us at info@nonrml.co.in',
  keywords: ['contact NoNRML', 'customer support', 'NoNRML customer service', 'product inquiries', 'order help', 'streetwear support India', 'NoNRML email', 'fashion brand contact'],
  openGraph: {
    title: 'Contact NoNRML - Customer Support & Inquiries',
    description: 'Get in touch with NoNRML for product information, order queries, or customer support. We\'re here to help!',
    url: 'https://www.nonrml.co.in/contact-us',
    type: 'website',
    locale: 'en_IN',
    siteName: 'NoNRML',
  },
  twitter: {
    card: 'summary',
    title: 'Contact NoNRML',
    description: 'Get in touch for product info, orders, or support.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.nonrml.co.in/contact-us',
  },
}

const ContactUsPage = () => {
    const mail = "info@nonrml.co.in";
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
