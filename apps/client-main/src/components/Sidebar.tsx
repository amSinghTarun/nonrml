"use client"

import React from 'react';
import Link from 'next/link';
import CallIcon from '@mui/icons-material/Call';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { SidebarButton } from "./ui/buttons";
import { useSetAppbarUtilStore } from "@/store/atoms";

export const Sidebar = ({ categoryList }: { categoryList: string[] }) => {
  const { appbarUtil } = useSetAppbarUtilStore();
    
    if(appbarUtil != "SIDEBAR") return (<></>);
    
    return (
    <>
      <div className="fixed z-40 backdrop-blur-sm bg-white/10 h-full w-full overflow-hidden overscroll-none"></div>
      <nav className="fixed flex flex-col w-screen max-h-screen justify-end items-center z-40 h-full">
        <aside className=" backdrop-blur-3xl flex flex-col shadow-sm shadow-black h-[60%] w-[90%] lg:w-[50%] lg:h-[70%] justify-between rounded-tr-xl rounded-tl-xl pb-5">
          {/* <div className="flex-col flex w-[100%] items-center">
            <Searchbar />
            {/* <div className="text-white">SHOP</div> */}
          {/* </div> */}
          <div color="white" className="flex-1 p-3 overflow-x-scroll ">
            <ul className="flex-col h-full flex divide-y divide-dotted items-center divide-black font-medium text-md">
              <li className="pt-2 pb-2 basis-1/3">
                    <SidebarButton display={"HOME"} href={"/"} />
              </li>
              {categoryList.map((category, index) => {
                const href = "/store/"+category.replace(" ", "_");
                return (
                  <li key={index} className="pt-2 pb-2 basis-1/3">
                    <SidebarButton display={category.toUpperCase()} href={href} />
                </li>
              )})}
            </ul>
          </div>
          <footer className="flex flex-col  font-medium text-sm text-center space-y-2 divide-y divide-dotted divide-black pl-2 pr-2">
            <div className="flex flex-row divide-x  divide-dotted divide-black pb-2 justify-around">
              <Link className="text-black flex flex-col flex-grow justify-center cursor-pointer" href="/contact-us">
                <div><CallIcon fontSize="large"></CallIcon></div>
                <div >Contact us</div>
              </Link>
              <Link className="text-black flex flex-col flex-grow cursor-pointer" href="www.instagram.com">
                <div><InstagramIcon fontSize="large" /></div>
                <div className="text-sm">Instagram</div>
              </Link>
              <Link className="text-black flex flex-col flex-grow cursor-pointer" href="/track-order">
                <div><LocalShippingIcon fontSize="large" /></div>
                <div>Track order</div>
              </Link>
            </div>
            <span className="flex pt-2 justify-center">ALL IT TAKES IS A NO TO REDEFINE WHAT IS NRML.</span >
          </footer>
        </aside>
      </nav>
      </>
    );
  };