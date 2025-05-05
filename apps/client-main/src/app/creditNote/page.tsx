import React from "react";
import { CreditNote } from "@/components/CreditNote";
import { Metadata } from 'next';

export const metadata: Metadata = {
  // Basic metadata fields
  title: `Credit Notes - NoNRML`,  // Browser tab title, search engine title
  description: `Buy Premium Unisex Streetwear T-shirts, Shirts and Jeans online from NoNRML `,  // Meta description for SEO
  keywords: ["premium T-shirts, Shirts and Jeans", "premium", "oversize T-shirts, Shirts and Jeans", "Streetwear", "streetwear ", "unisex"],
  robots: 'index, follow',
}

const CreditNotePage = async () => {
    
    return (
        <>
            <section className=" flex h-screen w-screen flex-row text-black justify-center items-center bg-white mb-64 lg:mb-32">
                <CreditNote className="h-[80%] w-[90%] xl:w-[50%]" ></CreditNote> 
            </section>
        </>

    )
}

export default CreditNotePage;