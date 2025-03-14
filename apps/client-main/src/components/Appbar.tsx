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
import logo from "@/images/logo.png";
import Image from "next/image";
import { redirect } from 'next/navigation';

export const Appbar = async () => {
    let categoryList = await redis.redisClient.get<string[]|null>("productCategory")
    if(!categoryList || !categoryList.length){
        const { categoryNameArray } = (await (await serverClient()).viewer.productCategories.getProductCategories({})).data;
        categoryList = categoryNameArray
    }

    return (
        <>
            <nav className=" w-full z-50 p-3 pr-0 h-14 backdrop-blur-3xl flex flex-row fixed top-0 justify-between ">
                <div className="basis-1/2 flex justify-left items-center gap-4 w-auto h-full b">
                    <MenuButton />
                    <UserButton />
                    <CartButton />
                </div>
                <div className="basis-1/2 items-center justify-end flex w-auto h-full">
                    <Link className='cursor-pointer h-full w-full justify-end flex' href='/'>
                        <Image
                            className='h-auto w-4/5 md:w-1/3 lg:w-1/4 bg-none p-0 object-cover'
                            src={logo}
                            alt="No NRML logo"
                            priority
                            width={0} height={0}
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