// Create this file: components/AnimatedLoadingClient.tsx
'use client';
import React, { useState, useEffect } from 'react';
import logo from "@/images/logo.png";
import Image from "next/image";
import { cn } from '@nonrml/common';

interface AnimatedLoadingClientProps {
  text?: string;
  className?: string
}

export default function AnimatedLoadingClient({ text, className }: AnimatedLoadingClientProps) {
  const [positions, setPositions] = useState<{ id: number; left: number; top: number }[]>([]);

  useEffect(() => {
    const randomInterval = setInterval(() => {
      setPositions((prev) => [
        ...prev.slice(-30), // Keep only last 20 items for performance
        {
          id: Date.now(),
          left: Math.random() * 100, // Random left position (0% - 100%)
          top: Math.random() * 100, // Random top position (0% - 100%)
        },
      ]);
    }, 180); // Adjust frequency of new random text here

    return () => clearInterval(randomInterval);
  }, []); // Add dependency array to fix the useEffect

  return (
    <div className={cn("relative w-screen h-screen overflow-hidden bg-white", className)}>
      <div className="absolute inset-0 flex justify-center items-center z-30 text-neutral-700 font-bold">
        <div className='p-4 backdrop-blur-lg rounded-lg'>
          <div className='justify-center flex '>
            <Image
              src={logo}
              alt="No NRML logo"
              priority
              width={0} 
              height={0} 
              sizes="100vw" 
              style={{ color:"white", width: 'auto', height: "40px"}}
            />
          </div>
          {text && (
            <div className="text-center mt-3 text-xs text-neutral-600">
              {text}
            </div>
          )}
        </div>
      </div>
      
      {/* Randomized words with your original animation */}
      {positions.map(({ id, left, top }) => (
        <div
          key={id}
          className="absolute text-neutral-400 text-[10px] font-bold animate-slow-fade rounded-xl pointer-events-none select-none"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          ALL IT TAKES IS A NO TO REDEFINE WHAT IS NRML
        </div>
      ))}
    </div>
  );
}