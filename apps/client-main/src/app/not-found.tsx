"use client"

import { GeneralButtonTransparent } from '@/components/ui/buttons'
import { redirect } from 'next/navigation'
 
export default async function NotFound() {
  return (
    <div className=" flex h-screen w-screen flex-col space-y-4 justify-center items-center bg-white mb-[500px] lg:mb-[220px]">
      <h2 className='text-neutral-700 text-xs font-bold tracking-[0.3em] uppercase'>Page Not Found</h2>
        <GeneralButtonTransparent 
            display="ENTER STORE" 
            className="flex w-[60%] items-center justify-center p-6 text-xs font-normal" 
            onClick={() => redirect("/collections")} 
        />
    </div>
  )
}