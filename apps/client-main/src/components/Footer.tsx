export const Footer = () => {
    return (
        <div className="bottom-0 h-fit flex-col lg:flex-row w-full gap-3 justify-around relative px-10 py-10 border-t border-black bg-white text-black flex">
            <div className="h-full w-full font-semibold items-center flex">Quick Links</div>
            <a className="h-full w-full font-medium lg:justify-center text-xs hover:underline hover:cursor-pointer items-center flex">T&C</a>
            <a className="h-full w-full font-medium lg:justify-center text-xs hover:underline hover:cursor-pointer items-center flex">PRIVACY POLICY</a>
            <a className="h-full w-full font-medium lg:justify-center text-xs hover:underline hover:cursor-pointer items-center flex">EXCANGE/RETURNS POLICY</a>
            <a className="h-full w-full font-medium lg:justify-center text-xs hover:underline hover:cursor-pointer items-center flex" href="/contact-us">CONTACT US</a>
            <a className="h-full w-full font-medium lg:justify-center text-xs hover:underline hover:cursor-pointer items-center flex">ABOUT</a>
        </div>
    )
} 
{/* <a className="h-full w-full font-medium lg:justify-center text-xs hover:underline hover:cursor-pointer items-center flex">INSTAGRAM_ICON</a> */}