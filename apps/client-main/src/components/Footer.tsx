export const Footer = () => {
    return (
        <div className="bottom-0 h-fit flex-col lg:flex-row w-full gap-3 text-xs justify-around fixed -z-50 p-10 border-t border-neutral-700 bg-black/45 text-neutral-800 flex">
            <div className="h-full w-full font-semibold items-center flex">QUICK LINKS</div>
            <a className="h-full w-full lg:justify-center hover:underline cursor-pointer items-center flex">T&C</a>
            <a className="h-full w-full lg:justify-center hover:underline cursor-pointer items-center flex">PRIVACY POLICY</a>
            <a className="h-full w-full lg:justify-center hover:underline cursor-pointer items-center flex">EXCANGE/RETURNS POLICY</a>
            <a className="h-full w-full lg:justify-center hover:underline cursor-pointer items-center flex" href="/contact-us">CONTACT US</a>
            <a className="h-full w-full lg:justify-center hover:underline cursor-pointer items-center flex">ABOUT</a>
        </div>
    )
} 
{/* <a className="h-full w-full font-medium lg:justify-center text-xs hover:underline cursor-pointer items-center flex">INSTAGRAM_ICON</a> */}