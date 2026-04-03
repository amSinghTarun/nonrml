"use client"

import { cn } from "@nonrml/common"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import logo from "@/images/logo.png"

export const Footer = ({className} : {className?: string}) => {
    const pathname = usePathname();
    const isHome = pathname === "/";

    // On home page, footer is rendered inline by landingPage.tsx — hide the fixed one
    if (isHome && !className) return null;

    return (
        <div className={cn(
            "bottom-0 h-fit flex-col w-full text-xs fixed -z-50 text-white flex bg-black",
            className
        )}>
            {/* Top section — Logo + Links */}
            <div className="flex flex-col lg:flex-row gap-8 lg:justify-between p-8 sm:p-10 pb-6 w-full">
                {/* Logo */}
                <div className="flex flex-col items-center lg:items-start justify-center lg:max-w-[250px]">
                    <Image
                        src={logo}
                        alt="NoNRML Logo"
                        width={160}
                        height={50}
                        className="h-8 lg:h-6 w-auto object-contain brightness-100 invert"
                    />
                </div>

                {/* Mobile: Links + Policies side by side, then Social below */}
                {/* Desktop: all three in a row handled by parent lg:flex-row */}
                <div className="flex flex-row lg:hidden justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 mb-1">QUICK LINKS</span>
                        {[
                            { href: "/collections", label: "SHOP ALL" },
                            { href: "/about", label: "OUR STORY" },
                            { href: "/contact-us", label: "CONTACT US" },
                        ].map(({ href, label }) => (
                            <Link key={href} href={href} className="text-[11px] text-white/60 hover:text-white transition-colors duration-300 tracking-wider w-fit group">
                                {label}
                                <span className="block w-0 group-hover:w-full h-px bg-white/50 transition-all duration-500" />
                            </Link>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 mb-1">POLICIES</span>
                        {[
                            { href: "/policies/terms-and-conditions", label: "TERMS & CONDITIONS" },
                            { href: "/policies/privacy-policy", label: "PRIVACY POLICY" },
                            { href: "/policies/return-and-exchange", label: "EXCHANGE & RETURNS" },
                        ].map(({ href, label }) => (
                            <a key={href} href={href} className="text-[11px] text-white/60 hover:text-white transition-colors duration-300 tracking-wider w-fit group">
                                {label}
                                <span className="block w-0 group-hover:w-full h-px bg-white/50 transition-all duration-500" />
                            </a>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-2 lg:hidden">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 mb-1">FOLLOW US</span>
                    <a href="https://www.instagram.com/nonrml.in" target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/60 hover:text-white transition-colors duration-300 tracking-wider w-fit group">
                        INSTAGRAM
                        <span className="block w-0 group-hover:w-full h-px bg-white/50 transition-all duration-500" />
                    </a>
                </div>

                {/* Desktop: individual columns */}
                <div className="hidden lg:flex flex-col gap-2">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 mb-1">QUICK LINKS</span>
                    {[
                        { href: "/collections", label: "SHOP ALL" },
                        { href: "/about", label: "OUR STORY" },
                        { href: "/contact-us", label: "CONTACT US" },
                    ].map(({ href, label }) => (
                        <Link key={href} href={href} className="text-[11px] text-white/60 hover:text-white transition-colors duration-300 tracking-wider w-fit group">
                            {label}
                            <span className="block w-0 group-hover:w-full h-px bg-white/50 transition-all duration-500" />
                        </Link>
                    ))}
                </div>
                <div className="hidden lg:flex flex-col gap-2">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 mb-1">POLICIES</span>
                    {[
                        { href: "/policies/terms-and-conditions", label: "TERMS & CONDITIONS" },
                        { href: "/policies/privacy-policy", label: "PRIVACY POLICY" },
                        { href: "/policies/return-and-exchange", label: "EXCHANGE & RETURNS" },
                    ].map(({ href, label }) => (
                        <a key={href} href={href} className="text-[11px] text-white/60 hover:text-white transition-colors duration-300 tracking-wider w-fit group">
                            {label}
                            <span className="block w-0 group-hover:w-full h-px bg-white/50 transition-all duration-500" />
                        </a>
                    ))}
                </div>
                <div className="hidden lg:flex flex-col gap-2">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 mb-1">FOLLOW US</span>
                    <a href="https://www.instagram.com/nonrml.in" target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/60 hover:text-white transition-colors duration-300 tracking-wider w-fit group">
                        INSTAGRAM
                        <span className="block w-0 group-hover:w-full h-px bg-white/50 transition-all duration-500" />
                    </a>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-8 sm:px-10 py-4 border-t border-white/[0.1]">
                <span className="text-[9px] tracking-[0.2em] text-white/50">
                    ALL IT TAKES IS A NO TO REDEFINE WHAT IS NORMAL.
                </span>
                <span className="text-[9px] tracking-[0.3em] text-white/50">
                    INDIA
                </span>
            </div>
        </div>
    )
}
