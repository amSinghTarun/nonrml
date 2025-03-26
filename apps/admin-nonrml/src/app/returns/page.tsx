"use client"

import Returns from "@/components/Returns";
import { trpc } from '@/app/_trpc/client';

export default () => {
  const returns = trpc.viewer.return.getAllReturns.useQuery({ }, {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return (
    <>
      <section className="flex flex-col w-screen h-screen text-black">
        <h1 className="text-left p-5 bg-stone-700 font-bold text-white"> Returns </h1>
        {returns.data && <Returns returns={returns.data.data} />}
        {returns.isLoading && <div>Loading...</div>}
        {returns.error && <div>Error: {returns.error.message}</div>}
      </section>
    </>
  );
}