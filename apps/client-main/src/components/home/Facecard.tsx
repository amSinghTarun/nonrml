"use client"

import React, { useEffect } from 'react';
import { El_Messiri } from "next/font/google";

const appFont = El_Messiri({ subsets: ["latin"], weight: ["400", "600", "500", "600"] });

const NoNRMLFaceCard: React.FC = () => {
  // Add animation keyframes dynamically to the document
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    // Define the keyframes animation
    styleEl.innerHTML = `
      @keyframes scrollText {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }
    `;
    // Append to head
    document.head.appendChild(styleEl);
    
    // Cleanup function
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className={`${appFont.className} h-[400px] font-semibold  text-white w-full  overflow-hidden pt-5`}>
      <p className='mb-0'>THEY TOLD ME TO BLEND IN</p>
      <p className='mb-0'>I CHOSE TO BREAK FORM.</p>
      <p className='mb-0'>TO SPEAK IN CHAOS</p>
      <p className='mb-0'>AND WEAR MY FLAWS LIKE FASHION.</p>
      <p className='mb-0'>I’VE SMILED THROUGH STORMS,</p>
      <p className='mb-0'>BLED BEHIND GRINS,</p>
      <p className='mb-0'>BUT NEVER BOWED</p>
      <p className='mb-0'>TO THE COMFORT OF PRETENDING.</p>
      <p className='mb-0'>NORMAL IS A CAGE</p>
      <p className='mb-0'>BUILT FROM SILENCE AND FEAR.</p>
      <p className='mb-0'>I’D RATHER BE LOUD, RAW,</p>
      <p className='mb-0'>UNAPOLOGETICALLY REAL.</p>
      <p className='mb-0'>THIS IS REBELLION.</p>
      <p className='mb-0'>THIS IS REMEMBERING WHO I AM</p>
      <p className='mb-0'>BEFORE THE WORLD TOLD ME WHO TO BE.</p>
      <p className='mb-1 bg-white text-black'>I AM ME.</p>
      <p className='mb-0 bg-white text-black'>I AM NoNRML.</p>

    </div>
  );
};

export default NoNRMLFaceCard;