'use client';

import React, { useState, useEffect } from 'react';
import logo from "@/images/logo.png";
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
        <div className="relative w-full h-full overflow-hidden bg-white">
            <div className="absolute inset-0 flex justify-center items-center z-30 text-neutral-700 font-bold">
                <div  className='p-4 backdrop-blur-lg rounded-lg'>
                    <div className='justify-center flex '>

                    <Image
                        src={logo}
                        alt="No NRML logo"
                        priority
                        width={0} height={0} 
                        sizes="100vw" 
                        style={{ color:"white",width: 'auto', height: "40px"}}
                    ></Image>
                    </div>
                </div>
            </div>

            {/* Randomized words */}
            {positions.map(({ id, left, top }) => (
                <div
                key={id}
                className="absolute text-neutral-400 text-[10px] font-bold animate-slow-fade rounded-xl"
                style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    transform: 'translate(-50%, -50%)',
                }}
                >
                {"ALL IT TAKES IS A NO TO REDEFINE WHAT IS NRML"}
                </div>
            ))}
        </div>
  )
};
