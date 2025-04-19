"use client";

import { useState, useCallback } from "react";
import { Users } from "@/components/Users";
import { trpc } from "@/app/_trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function UsersPage() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showAllUsers, setShowAllUsers] = useState(true);
    
    const usersFetch = trpc.viewer.user.getUsersInfo.useQuery(
        {}, // query params
        {
            staleTime: Infinity,
            cacheTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        }
    );

    const searchUserQuery = trpc.viewer.user.getUsersInfo.useQuery({ 
            mobile: +phoneNumber
        }, {
            enabled: false,
            staleTime: Infinity,
            cacheTime: Infinity,
    });
    const handleSearch = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!phoneNumber && usersFetch.data == undefined) return;
        try {
            setShowAllUsers(false);
            await searchUserQuery.refetch();
        } catch (error) {
            console.error("Error searching user:", error);
        }
    }, [phoneNumber, searchUserQuery, usersFetch.data]);

    const handleShowAllUsers = () => {
        setShowAllUsers(true);
        setPhoneNumber("");
    };

    // Determine which data to show based on showAllUsers state
    const displayData = showAllUsers ? usersFetch : searchUserQuery;

    return (
        <div className="w-screen h-screen  ">
            <div className="flex flex-row justify-start p-5 bg-stone-700 font-bold text-white gap-10">
                <h1 className="text-sm font-bold items-center flex">USERS</h1>
                <Button 
                    onClick={handleShowAllUsers}
                    variant={showAllUsers ? "secondary" : "default"}
                >
                    All
                </Button>
                <form onSubmit={handleSearch} className="flex bg-white rounded-md">
                    <Input
                        type="text"
                        value={phoneNumber}
                        maxLength={10}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-xs outline-none rounded-r-none border-0"
                    />
                    <Button 
                        type="submit"
                        disabled={!phoneNumber}
                        variant={"secondary"}
                        className="rounded-l-none"
                    >
                        <Search size={16}/>
                    </Button>
                </form>
            </div>
            
            {displayData.isLoading ? (
                <div>Loading...</div>
            ) : displayData.error ? (
                <div>Error: {displayData.error.message}</div>
            ) : (
                <Users users={displayData} />
            )}
        </div>
    );
}