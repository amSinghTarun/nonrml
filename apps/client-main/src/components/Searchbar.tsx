import React from "react"
import SearchIcon from '@mui/icons-material/Search';

export const Searchbar = () => {
    return (
        <>
            <form className="hover:cursor-pointer flex flex-row lg:hidden bg-white/55 border-0 border-black rounded-xl w-[90%] p-3 justify-between">
                <input className="text-black bg-transparent w-[100%] outline-none placeholder-black" placeholder="SEARCH . . ."></input>
                <SearchIcon className="animate-bounce" sx={{ color: 'black' }} />
            </form>
        </>
    )
}