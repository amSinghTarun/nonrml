"use client"

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSetAppbarUtilStore } from "@/store/atoms";
import { useSession } from 'next-auth/react';
import { FlipWords } from './ui/flip-words';

export const Sidebar = ({ categoryList }: { categoryList: string[] }) => {
  const { appbarUtil } = useSetAppbarUtilStore();
  const { data: session } = useSession();
  const words = ["NORMAL", "STANDARD", "USUAL", "ORDINARY", "COMMON"]; 
  
  // Block background scroll when sidebar is open
  useEffect(() => {
    if (appbarUtil === "SIDEBAR") {
      const originalOverflow = document.body.style.overflow;
      const originalHeight = document.body.style.height;
      
      // Use overflow hidden instead of position fixed
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.height = originalHeight;
      };
    }
  }, [appbarUtil]);
    
  if(appbarUtil != "SIDEBAR") return (<></>);
    
  return (
    <>
      {/* Background blur overlay */}
      <div 
        className="fixed inset-0 z-40 backdrop-blur-sm bg-white/10 overflow-hidden"
        style={{ touchAction: 'none' }}
      />
      
      {/* Modal container - REMOVE animation classes from here */}
      <nav className="fixed flex flex-col w-screen max-h-screen justify-end items-center z-40 h-full">
        {/* Apply animation only to the aside content */}
        <aside className="backdrop-blur-2xl bg-white/10 flex flex-col shadow-sm shadow-neutral-500 h-[60%] w-[90%] lg:w-[50%] lg:h-[70%] justify-between rounded-t-md pb-5 overflow-hidden translate-y-full animate-[slideUp_0.1s_ease-out_forwards]">
          {/* Navigation content - scrollable if needed */}
          <div color="white" className="flex-1 p-3 px-3 overflow-y-auto">
            <div className="flex-col h-full flex divide-black font-bold text-sm">
              <Link href={"/"} className={` text-center py-2 basis-1/${categoryList.length+1} content-center rounded-md hover:underline`}>
                <span>HOME</span>
              </Link>
              {categoryList.map((category, index) => {
                const href = "/collections/"+category.replace(" ", "-");
                return (
                  <Link href={href} key={index} className={`py-2 basis-1/${categoryList.length+1} content-center text-center rounded-md hover:underline`}>
                    <span>{category.toUpperCase()}</span>
                  </Link>
                )})}
            </div>
          </div>
          
          {/* Footer - always visible */}
          <footer className="flex flex-col text-xs text-center space-y-2 divide-y divide-dotted divide-black px-2 flex-shrink-0">
            <div className="flex flex-row divide-x divide-dotted divide-black py-1 font-bold justify-evenly">
              <Link className="text-neutral-800 flex-1 justify-center cursor-pointer hover:underline py-2" href="/orders">
                ORDERS
              </Link>
              <Link className="text-neutral-800 flex-1 justify-center hover:underline py-2" href="/creditNote">
                CREDIT NOTES
              </Link>
              <Link className="text-neutral-800 flex-1 justify-center cursor-pointer hover:underline py-2" href="/track-order">
                TRACK ORDER
              </Link>
            </div>
            <span className="flex text-[10px] md:text-xs pt-2 text-neutral-700 justify-center">
              ALL IT TAKES IS A NO TO REDEFINE WHAT IS <FlipWords className="text-red-600" words={words} />
            </span>
          </footer>
        </aside>
      </nav>
    </>
  );
};