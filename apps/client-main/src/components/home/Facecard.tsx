"use client"

import React, { useEffect } from 'react';


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
    <div className={`h-[400px] font-semibold  text-black w-full  overflow-hidden pt-5`}>
      <p className='mb-0'>They Told Me To Blend In,</p>
      <p className='mb-0'>I Chose To Break Form.</p>
      <p className='mb-0'>To Speak In Chaos,</p>
      <p className='mb-0'>And Wear My Flaws Like Fashion.</p>
      <p className='mb-0'>I’ve Smiled Through Storms,</p>
      <p className='mb-0'>Bled Behind Grins,</p>
      <p className='mb-0'>But Never Bowed</p>
      <p className='mb-0'>To The Comfort Of Pretending.</p>
      <p className='mb-0'>Normal Is A Cage</p>
      <p className='mb-0'>Built From Silence And Fear.</p>
      <p className='mb-0'>I’d Rather Be Loud, Raw, Unapologetically Real.</p>
      <p className='mb-0'>This Is Rebellion.</p>
      <p className='mb-0'>This Is Remembering Who I Am,</p>
      <p className='mb-0'>Before The World Told Me Who To Be.</p>
      <p className='mb-0 text-red-500'>I AM ME.</p>
      <p className='mb-0 text-red-500'>I AM NoNRML.</p>

    </div>
  );
};

export default NoNRMLFaceCard;