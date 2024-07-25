import { Inter, Yeseva_One, Vidaloka, Ubuntu, Ultra, Kenia } from "next/font/google";

const taglineFont = Ultra({ subsets: ["latin"] , weight:"400"});

export const HomeDisplayText = () => {
    return (
        <>
            <div className="items-center grid grid-flow-row grid-rows-5 min-h-screen">
                <div className="row-span-4">
                <a className={`${taglineFont.className} animate-linear bg-gradient-to-r from-dark via-sky-50 to-dark bg-[length:200%_auto] bg-clip-text text-4xl sm:text-6xl font-extrabold text-transparent m-0 p-0`}>
                    {`ALL IT TAKES IS A `}
                </a>
                <a className={`${taglineFont.className} animate-linear bg-gradient-to-r from-dark to-dark bg-[length:200%_auto] bg-clip-text text-4xl sm:text-6xl font-extrabold text-transparent m-0 p-0`}>
                    {`NO `}
                </a>
                <a className={`${taglineFont.className} animate-linear bg-gradient-to-r from-dark via-sky-50 to-dark bg-[length:200%_auto] bg-clip-text text-4xl sm:text-6xl font-extrabold text-transparent m-0 p-0`}>
                    {`TO REDEFINE WHAT IS `}
                </a>
                <a className={`${taglineFont.className} animate-linear bg-gradient-to-r from-dark  to-dark bg-[length:200%_auto] bg-clip-text text-4xl sm:text-6xl font-extrabold text-transparent m-0 p-0`}>
                    {'NRML'}
                </a>
                </div>
                <h1 className="text-center hover:cursor-pointer animate-bounce">
                    SHOP ALL
                </h1>
            </div>
      </>
    )
}