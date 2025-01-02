// components/Spinner.tsx
// import React from 'react';

// const Spinner: React.FC = () => {
//   return (
//     <div className="flex items-center justify-center h-full bg-none flex-col space-y-2">
//       <div className="relative w-24 h-24">
//         <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white to-red-400 animate-spin-fast"></div>
//         <div className="min-h-full items-center align-middle text-center justify-center">nvovoirbvor</div>
//         <div className="absolute inset-0 rounded-full border-t-[20px] border-white animate-spin-slow"></div>
//       </div>
//       <span  className="text-sm font-medium">PROCESSING YOUR PAYMENT.... </span>
//     </div>
//   );
// };

// export default Spinner;


// components/AnimatedText.tsx
'use client';

import React, { useState, useEffect } from 'react';
import logo from "@/images/logo.jpg";
import Image from "next/image";

export default function Loading({ text }: {text?:string}) {
  const [positions, setPositions] = useState<{ id: number; left: number; top: number }[]>([]);

  useEffect(() => {
    const randomInterval = setInterval(() => {
      setPositions((prev) => [
        ...prev,
        {
          id: Date.now(),
          left: Math.random() * 100, // Random left position (0% - 100%)
          top: Math.random() * 100, // Random top position (0% - 100%)
        },
      ]);
    }, 300); // Adjust frequency of new random text here

    return () => clearInterval(randomInterval);
  });

  return (

        <div className="relative w-full h-full overflow-hidden">
            <div className="absolute inset-0 flex justify-center items-center z-30 text-black font-bold">
                <div  className='p-4 bg-white rounded-xl '>
                    <div className='justify-center flex '>

                    <Image
                        src={logo}
                        alt="No NRML logo"
                        priority
                        width={0} height={0} 
                        sizes="100vw" 
                        style={{ color:"white",width: 'auto', height: "60px"}}
                    ></Image>
                    </div>
                    <span className='animate-pulse text-[10px] sm:text-sm'>
                        {text ?? "ALL IT TAKES IS A NO TO REDEFINE WHAT IS NRML"}
                    </span>
                </div>
            </div>

            {/* Randomized words */}
            {positions.map(({ id, left, top }) => (
                <div
                key={id}
                className="absolute text-red-300 text-lg font-bold animate-slow-fade rounded-xl"
                style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    transform: 'translate(-50%, -50%)',
                }}
                >
                {"NoNRML"}
                </div>
            ))}
        </div>
  )
};
