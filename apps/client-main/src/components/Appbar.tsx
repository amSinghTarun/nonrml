
import Image from 'next/image';
import React from 'react';
// import logo from "../images/logo.png"
import { MenuButton } from './buttons/MenuButton';
import { UserButton } from './buttons/UserButton';
import CartButton from './buttons/CartButton';
import { Sidebar } from './Sidebar';
import { redis } from '@nonrml/cache';
import { serverClient } from '@/app/_trpc/serverClient';
import { CartMenu } from './Cart';
import { UserAccessibility } from './UserAccessibility';
import Link, { LinkProps } from 'next/link';


export const Appbar = async () => {
    let categoryList = await redis.getSetsMembers("productCategory")
    if(categoryList.length == 0){
        //console.log("*--* TRPC call from server to fetch categoryList")
        const { data:{categoryNameArray} } = await serverClient().viewer.productCategories.getProductCategories();
        categoryList = categoryNameArray
    }

    return (
        <>
            <nav className=" w-full z-50 p-3 h-14 backdrop-blur-3xl flex flex-row fixed top-0 justify-between ">
                <div className="basis-1/2 flex justify-left items-center gap-3 w-auto h-full">
                    <MenuButton />
                    <UserButton />
                    <CartButton />
                </div>
                <div className="basis-1/2 items-center justify-end flex w-auto h-full">
                    <Link className='hover:cursor-pointer' href='/'>
                        Logo               
                        {/* <Image
                            src={logo}
                            alt="No NRML logo"
                            priority
                            width={0} height={0} 
                            sizes="100vw" 
                            style={{ color:"white",width: 'auto', height: "33px"}}
                        ></Image> */}
                    </Link>
                </div>
            </nav>
            <Sidebar categoryList={categoryList} />
            <CartMenu/>
            <UserAccessibility />
       </>
    )
}