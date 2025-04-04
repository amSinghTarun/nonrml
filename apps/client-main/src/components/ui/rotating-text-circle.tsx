'use client';

import React from 'react';

interface RotatingCircleTextProps {
  text: string;
  radius?: number;
  speed?: number; // in seconds per full rotation
}

export const RotatingCircleText: React.FC<RotatingCircleTextProps> = ({
  text,
  radius = 70,
  speed = 20,
}) => {
  const characters = text.split('');
  const degreeStep = 360 / characters.length;

  return (
    <div className="relative w-[250px] h-[250px] mx-auto">
      <div
        className="absolute inset-0"
        style={{
          animation: `spin ${speed}s linear infinite`,
        }}
      >
        {characters.map((char, index) => {
          const rotate = index * degreeStep;
          const angleInRadians = (rotate * Math.PI) / 180;
          const x = radius * Math.cos(angleInRadians);
          const y = radius * Math.sin(angleInRadians);

          return (
            <span
              key={index}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
                transformOrigin: 'center',
                fontSize: '120px',
                whiteSpace: 'nowrap',
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Add custom spin animation */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
