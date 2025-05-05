import { TrackOrder } from "@/components/TrackOrder";
import { Metadata } from 'next';

export const metadata: Metadata = {
  // Basic metadata fields
  title: `Track Order - NoNRML`,  // Browser tab title, search engine title
  description: `Buy Premium Unisex Streetwear T-shirts, Shirts and Jeans online from NoNRML `,  // Meta description for SEO
  keywords: ["premium T-shirts, Shirts and Jeans", "premium", "oversize T-shirts, Shirts and Jeans", "Streetwear", "streetwear ", "unisex"],
  robots: 'index, follow',
}

const TrackOrderPage = async () => {
    return (
        <>
            <section className=" flex h-screen w-screen flex-row text-black justify-center items-center mb-64 bg-white lg:mb-32">
                <TrackOrder className="h-[80%] w-[90%] xl:w-[50%]" ></TrackOrder> 
            </section>
        </>

    )
}

export default TrackOrderPage;