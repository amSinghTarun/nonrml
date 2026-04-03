"use client"

import React, { ReactNode, ReactElement } from 'react';
import Link, { LinkProps} from 'next/link';

interface DropdownMenuProps {
    children: ReactElement<DropdownButtonProps> | ReactElement<DropdownButtonProps>[];
}

const DropdownMenu : React.FC<DropdownMenuProps> = ({ children }) => {
    return ( 
        <nav className="fixed flex flex-col mt-14 z-40 left-7 backdrop-blur-3xl rounded-b-3xl space-y-2 p-2 text-sm animate-[slideDown_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            {children}
        </nav>
    );
};

interface DropdownButtonProps {
    display: string;
    onClick?: () => void,
    href?: string
}

const DropdownButton: React.FC<DropdownButtonProps> = ( inputs => {
    if (inputs.href) {
        return (
          <Link href={inputs.href} className="cursor-pointer z-40 items-center flex justify-center flex-1 rounded-xl p-3 bg-black text-white hover:bg-white hover:text-black text-[10px] tracking-[0.15em] uppercase font-bold">
            {inputs.display}
          </Link>
        );
    }
    
    return (
        <div
            onClick={inputs.onClick}
            className="cursor-pointer z-30 items-center flex justify-center flex-1 rounded-xl p-3 bg-black text-white hover:bg-white hover:text-black text-[10px] tracking-[0.15em] uppercase font-bold"
        >
            {inputs.display}
        </div>
    )
})

export {
    DropdownButton,
    DropdownMenu
};