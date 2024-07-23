
import Image from 'next/image';
import SearchIcon from '@mui/icons-material/Search';
import logo from "../images/logo.png"
import { MenuButton } from './buttons/menuButton';

import { UserButton } from './buttons/userButton';
import { redirect, RedirectType } from 'next/navigation';
import CartButton from './buttons/cartButton';
import { Sidebar } from './sidebar';
import { UserAccessibilityDropdown } from './dropdowns/userAccessibility';

export const Appbar = () => {

    return (
        <>
            <nav className=" px-2 py-4 sm:p-5 w-full z-50 h-14 lg:h-20 md:h-16 bg-white flex flex-row fixed top-0 items-center">
                <div className="basis-1/4 flex">
                    <MenuButton />
                </div>
                <div className="basis-2/3 flex justify-center">
                {/* clicking on image should redirect to the home page onClick={() => {redirect("/signup")}} */}
                    <div className='hover:cursor-pointer' >
                        <Image
                            src={logo}
                            alt="logo"
                            style={{ width: 'auto', height: '40px', maxHeight: "60px" }}
                            // height={25}
                        ></Image>
                    </div>
                </div>
                <div className="basis-1/4 flex justify-end items-center md:gap-6 gap-1">
                    <div className="hover:cursor-pointer max-lg:hidden ">
                        <SearchIcon sx={{fontSize: {xs:25, sm:32, md:40} }} />
                    </div>
                    <UserButton></UserButton>
                    <CartButton></CartButton>
                </div>
            </nav>
            <Sidebar />
            <UserAccessibilityDropdown />
        </>
    )
}



/*
    <Paper component="form" sx={{display: 'flex', backgroundColor: "black", borderRadius: '100px' }} >
                        <InputBase
                            sx={{ ml: 2,  color: 'white', flex: 1 }}
                            placeholder="What's on your mind today?"
                        />
                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon sx={{color: 'white'}}/>
                        </IconButton>
                    </Paper>
*/