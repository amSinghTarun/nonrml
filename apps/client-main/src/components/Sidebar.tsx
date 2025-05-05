"use client"

import React from 'react';
import Link from 'next/link';
import { useSetAppbarUtilStore } from "@/store/atoms";
import { useSession } from 'next-auth/react';
import { FlipWords } from './ui/flip-words';

export const Sidebar = ({ categoryList }: { categoryList: string[] }) => {
  const { appbarUtil } = useSetAppbarUtilStore();
  const { data: session } = useSession();
  const words = ["NORMAL", "STANDARD", "USUAL", "ORDINARY", "COMMON"]; 
    
    if(appbarUtil != "SIDEBAR") return (<></>);
    
    return (
    <>
      <div className="fixed z-40 backdrop-blur-sm bg-white/10 h-full w-full overflow-hidden overscroll-none"></div>
      <nav className="fixed flex flex-col w-screen max-h-screen justify-end items-center z-40 h-full translate-y-full animate-[slideUp_0.1s_ease-out_forwards]">
        <aside className=" backdrop-blur-2xl bg-white/10 flex flex-col shadow-sm shadow-neutral-500 h-[60%] w-[90%] lg:w-[50%] lg:h-[70%] justify-between rounded-t-md pb-5">
          {/* <div className="flex-col flex w-[100%] items-center">
            <Searchbar />
            {/* <div className="text-white">SHOP</div> */}
          {/* </div> */}
          <div color="white" className="flex-1 p-3 px-3 ">
            <div className="flex-col h-full flex divide-black font-bold text-sm">
              <Link href={"/"} className={` text-center py-2 basis-1/${categoryList.length+1} content-center rounded-md hover:underline`}>
                <span>HOME</span>
              </Link>
              {categoryList.map((category, index) => {
                const href = "/store/"+category.replace(" ", "_");
                return (
                  <Link href={href} key={index} className={`py-2 basis-1/${categoryList.length+1} content-center text-center rounded-md hover:underline`}>
                    <span>{category.toUpperCase()}</span>
                </Link>
              )})}
            </div>
          </div>
          <footer className="flex flex-col text-xs text-center space-y-2 divide-y divide-dotted divide-black px-2">
            <div className="flex flex-row divide-x divide-dotted divide-black py-1 font-bold justify-evenly">
              <Link className="text-neutral-800 flex-1 justify-center cursor-pointer hover:underline py-2" href="/account">
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