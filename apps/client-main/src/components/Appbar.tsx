import React from 'react';
import { MenuButton } from './buttons/MenuButton';
import { UserButton } from './buttons/UserButton';
import CartButton from './buttons/CartButton';
import { Sidebar } from './Sidebar';
import { redis } from '@nonrml/cache';
import { serverClient } from '@/app/_trpc/serverClient';
import { CartMenu } from './Cart';
import { UserAccessibility } from './UserAccessibility';
import Link from 'next/link';
import logo from "@/images/logo.jpg";
import Image from "next/image";

export const Appbar = async () => {
    let categoryList = await redis.redisClient.get<string[]|null>("productCategory")
    if(!categoryList || !categoryList.length){
        const { categoryNameArray } = (await (await serverClient()).viewer.productCategories.getProductCategories({})).data;
        categoryList = categoryNameArray
    }

    return (
        <>
            <nav className=" w-full z-50 p-3 h-14 backdrop-blur-3xl flex flex-row fixed top-0 justify-between ">
                <div className="basis-1/2 flex justify-left items-center gap-4 w-auto h-full">
                    <MenuButton />
                    <UserButton />
                    <CartButton />
                </div>
                <div className="basis-1/2 items-center justify-end flex w-auto h-full">
                    <Link className='cursor-pointer' href='/'>
                        <Image
                            src={logo}
                            alt="No NRML logo"
                            priority
                            width={0} height={0} 
                            sizes="100vw" 
                            style={{ color:"white",width: 'auto', height: "33px"}}
                        ></Image>
                    </Link>
                </div>
            </nav>
            <Sidebar categoryList={categoryList} />
            <UserAccessibility />
            <CartMenu/>
       </>
    )
};