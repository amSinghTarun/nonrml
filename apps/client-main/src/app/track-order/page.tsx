import { TrackOrder } from "@/components/TrackOrder";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Order - NoNRML | Order Status & Delivery Tracking',
  description: 'Track your NoNRML order status and delivery in real-time. Enter your order details to get the latest updates on your premium streetwear shipment and estimated delivery date.',
  keywords: ['track order NoNRML', 'order tracking', 'delivery status', 'shipment tracking', 'order status India', 'NoNRML delivery', 'track streetwear order', 'shipping updates'],
  openGraph: {
    title: 'Track Your Order - NoNRML',
    description: 'Track your NoNRML order status and delivery in real-time. Get updates on your premium streetwear shipment.',
    url: 'https://www.nonrml.co.in/track-order',
    type: 'website',
    locale: 'en_IN',
    siteName: 'NoNRML',
  },
  twitter: {
    card: 'summary',
    title: 'Track Order - NoNRML',
    description: 'Track your order status and delivery in real-time.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.nonrml.co.in/track-order',
  },
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