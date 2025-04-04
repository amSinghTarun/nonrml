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
    <div className="relative h-[600px] w-full  text-white bg-black overflow-hidden font-[Montserrat] pt-5">
      {/* Noise Overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Restriction Tape Background */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.2] pointer-events-none">
        {/* Generate multiple tape lines at different positions */}
        {[
          { top: '10%', rotate: '-30deg', texts: ['NONRML', 'RESTRICTED'] },
          { top: '30%', rotate: '-25deg', texts: ['NOT NORMAL', 'NONRML'] },
          { top: '50%', rotate: '-35deg', texts: ['SAY NO', 'NONRML'] },
          { top: '70%', rotate: '-20deg', texts: ['DARE TO CREATE', 'NONRML'] },
          { top: '90%', rotate: '-28deg', texts: ['BE STUBBORN', 'SAY NO'] },
        ].map((position, index) => (
          <div 
            key={index}
            className="absolute h-[60px] bg-yellow-500 text-black -m-4 font-[Bebas_Neue] text-[28px] tracking-[5px] flex items-center whitespace-nowrap overflow-hidden"
            style={{ 
              top: position.top, 
              width: '200%',
              transform: `rotate(${position.rotate})`,
              transformOrigin: 'left center',
            }}
          >
            <div 
              className="flex"
              style={{
                animation: 'scrollText 30s linear infinite'
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                position.texts.map((text, j) => (
                  <span key={`${i}-${j}`} className="mr-[30px]">{text}</span>
                ))
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Content Wrapper */}
      <div className="flex flex-col justify-center h-full p-6 relative z-10">
        {/* Heading */}
        <h1 className="font-[Bebas_Neue] text-6xl leading-[0.9] text-white tracking-[0.2rem] relative mb-8">
          NoNRML FACECARD
          <span className="absolute bottom-[-1rem] left-0 w-20 h-1 bg-white"></span>
        </h1>
        
        {/* Body Text */}
        <div className="leading-relaxed text-sm md:text-base max-w-[800px] font-semibold relative">
          <div className="mb-6 font-bold text-left">
            {/* <span className='bg-white text-black'> */}
              Thought we were just another normal streetwear brand?
              {/* </span>  */}
            <br/> 
            {/* <span className="font-extrabold text-base md:text-lg  px-1 text-black tracking-wider relative z-10 bg-white "> */}
              Nah, we are NoNRML.
              {/* </span>  */}
          </div>

          <div className="font-semibold mb-6 text-center">
            Our vision?
            <br/> Difficult but simple, Unite the beautiful misfits who said NO to NORMAL
          </div>
          
          <p className="mb-6 text-center">
            Streetwear became a whisper when it was born to scream.
            {/* <span className='bg-white md:text-lg text-black px-1'>  */}
              <br/>NoNRML isn't just fashion or clothing, it's rebelion against the Normal
              {/* </span> */}
          </p>
          
          <p className="mb-6 text-right">
            {/* <span className='bg-white text-black px-1'> */}
            For the ones still figuring it out. 
            <br/>For those who never fit the mold. 
            <br/>NoNRML is your refusal to settle, your way of saying: I’ll define me.
            {/* </span> */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoNRMLFaceCard;