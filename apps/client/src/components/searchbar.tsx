import React from "react"
import SearchIcon from '@mui/icons-material/Search';

export const Searchbar = () => {
    return (
        <>
            <form className="hover:cursor-pointer flex flex-row lg:hidden border border-white rounded-xl w-[90%] p-3 justify-between">
                <input className="text-white bg-transparent  w-[100%] outline-none placeholder-white" placeholder="SEARCH..."></input>
                <SearchIcon sx={{ color: 'white' }} />
            </form>
        </>
    )
}