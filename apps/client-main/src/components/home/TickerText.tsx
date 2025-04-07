"use client"
import React, { useEffect, useRef, useState } from 'react';
import { El_Messiri } from "next/font/google";

const appFont = El_Messiri({ subsets: ["latin"], weight: ["400"] });

interface TickerTextProps {
  text?: string;
  textColor?: string;
  fontSize?: number;
  backgroundColor?: string;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  width?: number | string;
  height?: number | string;
}

export const TickerText: React.FC<TickerTextProps> = ({
  text = 'ALL IT TAKES IS A NO TO REDEFINE WHAT IS NORMAL.',
  textColor = "black",
  fontSize = 15,
  backgroundColor = "transparent",
  direction = "right",
  pauseOnHover = true,
  width = "100%",
  height = "40px"
}) => {
  const tickerRef = useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  let NonrmlWords = ["NORMAL", "ORDINARY", "STANDARD", "COMMON", "USUAL"]

  useEffect(() => {
    if (tickerRef.current) {
      const span = tickerRef.current.querySelector('span');
      if (span) {
        setTextWidth(span.offsetWidth);
      }
    }
  }, [fontSize, text]);

  return (
    <div
      style={{
        width,
        height,
        backgroundColor,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        ref={tickerRef}
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: `${direction === 'left' ? 'scrollLeft' : 'scrollRight'} 50s linear infinite`,
        }}
        onMouseEnter={pauseOnHover ? (e) => {
          (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused';
        } : undefined}
        onMouseLeave={pauseOnHover ? (e) => {
          (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running';
        } : undefined}
      >
        {/* Duplicate the text at least twice for continuous loop */}
        {Array.from({ length: 15 }).map((_, i) => (
          <span
            key={i}
            style={{
              color: textColor,
              fontSize: `${fontSize}px`,
              fontFamily: appFont.style.fontFamily,
              paddingLeft: "6px"
            }}
          >
            ALL IT TAKES IS A <span className='text-red-400'>NO</span> TO REDEFINE WHAT IS <span className='text-red-400 pr-1'>{NonrmlWords[Number(i%NonrmlWords.length)]}</span> • 
          </span>
        ))}
      </div>

      {/* Keyframes style */}
      <style jsx>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scrollRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
};
