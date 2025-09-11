"use client"

import React from "react";

import { redirect } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import HomePageImagesManager from "@/components/homeImage";

const HomeImagePage = () => {
    const images = trpc.viewer.homeImages.getHomeImagesAdmin.useQuery();
    return (
        <section className="   flex flex-col w-screen h-screen text-black text-sm">
            <div className="flex flex-row py-5 px-5 bg-stone-700 rounded-t-lg font-bold text-white justify-between">
                <h1 className="text-left p-2 justify-center">Home Images</h1>
            </div>
            {images.data?.data && <HomePageImagesManager images={images}/>}
            {images.isLoading && <div>Loading...</div>}
            {images.error && <div>Error: {images.error?.message}</div>}
        </section>
    );
};

export default HomeImagePage;
