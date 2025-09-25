import { cn } from "@nonrml/common"


export const Footer = ({className} : {className?: string}) => {
    return (
        <div className={cn("bottom-0 h-fit flex-col w-full text-xs fixed -z-50 border-t border-neutral-700 bg-black/45 text-neutral-800 flex", className)}>
            <div className="flex lg:flex-row flex-col gap-3 justify-around p-10 pb-4 w-full">
                <div className="h-full w-full font-semibold items-center flex">QUICK LINKS</div>
                <a className="h-full w-full lg:justify-center hover:underline cursor-pointer items-center flex" href="/policies/terms-and-conditions">T&C</a>
                <a className="h-full w-full lg:justify-center hover:underline cursor-pointer items-center flex" href="/policies/privacy-policy">PRIVACY POLICY</a>
                <a className="h-full w-full lg:justify-center hover:underline cursor-pointer items-center flex" href="/policies/return-and-exchange">EXCANGE/RETURNS POLICY</a>
                <a className="h-full w-full lg:justify-center hover:underline cursor-pointer items-center flex" href="/contact-us">CONTACT US</a>
                <a className="h-full w-full lg:justify-center hover:underline cursor-pointer items-center flex" href="/about">OUR STORY</a>
            </div>
            <div className="flex flex-1 flex-row p-3 justify-around w-full border-t-2 border-neutral-800  font-light">
                <a href="https://www.instagram.com/nonrml.in" className="lg:justify-center hover:underline cursor-pointer items-center flex">INSTAGRAM</a>
                {/* <a className="lg:justify-center hover:underline cursor-pointer items-center flex">FACEBOOK</a> */}
            </div>
        </div>
    )
} 
{/* <a className="h-full w-full font-bold lg:justify-center text-xs hover:underline cursor-pointer items-center flex">INSTAGRAM_ICON</a> */}