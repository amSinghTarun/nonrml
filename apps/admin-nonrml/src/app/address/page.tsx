"use client"

import { trpc } from '@/app/_trpc/client';
import { useSearchParams } from 'next/navigation';
import { Addresses } from '@/components/Addresses';

const AddressPage = () => {
    const userIdParam = useSearchParams().get('userId');
    if(!userIdParam) return <></>
    const addresses = trpc.viewer.address.getUserAddress.useQuery({userId: +userIdParam});
    return (
        <>
            <section className="flex flex-col   w-screen h-screen text-black ">
            <h1 className="text-left py-5 px-5 bg-stone-700 font-bold text-white">ADDRESS</h1>
                <Addresses addresses={addresses} /> 
                {addresses.isLoading && <div>Loading...</div>}
                {addresses.error && <div>Error: {addresses.error.message}</div>}
            </section>
        </>
    )
}

export default AddressPage