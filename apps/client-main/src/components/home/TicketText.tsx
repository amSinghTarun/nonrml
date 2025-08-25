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
  textColor = "white",
  fontSize = 17,
  backgroundColor = "black",
  direction = "right",
  pauseOnHover = true,
  width = "100%",
  height = "80px"
}) => {
  const tickerRef = useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  let NonrmlWords = ["NORMAL", "ORDINARY", "STANDARD", "COMMON", "USUAL"];
  let separators = ["•", "★", "◆", "▲", "●"];

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
        // backgroundColor,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        // background: `linear-gradient(90deg, 
        //   ${backgroundColor} 0%, 
        //   ${backgroundColor}f0 10%, 
        //   ${backgroundColor} 90%, 
        //   ${backgroundColor} 100%)`,
        // boxShadow: isHovered ? 'inset 0 0 20px rgba(0,0,0,0.1)' : 'none',
        // transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Gradient overlays for fade effect */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '50px',
          height: '100%',
          // background: `linear-gradient(90deg, ${backgroundColor} 0%, transparent 100%)`,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '50px',
          height: '100%',
          // background: `linear-gradient(270deg, ${backgroundColor} 0%, transparent 100%)`,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      <div
        ref={tickerRef}
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: `${direction === 'left' ? 'scrollLeft' : 'scrollRight'} 100s linear infinite`,
          transform: 'scale(1)',
          transition: 'transform 0.3s ease',
        }}
        // onMouseEnter={pauseOnHover ? (e) => {
        //   (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused';
        // } : undefined}
        // onMouseLeave={pauseOnHover ? (e) => {
        //   (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running';
        // } : undefined}
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <span
            key={i}
            style={{
              color: textColor,
              fontSize: `${fontSize}px`,
              paddingLeft: "6px",
              fontWeight: "bold",
              textShadow: isHovered ? '1px 1px 2px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s ease',
              animation: `textGlow 3s ease-in-out infinite ${i * 0.2}s`,
            }}
          >
            ALL IT TAKES IS A{' '}
            <span 
              className="underline decoration-red-500"
              style={{
                textDecorationThickness: '2px',
                textUnderlineOffset: '3px',
              }}
            >
              NO
            </span>{' '}
            TO REDEFINE WHAT IS{' '}
            <span 
              className="underline decoration-red-500"
              style={{
                textDecorationThickness: '2px',
                textUnderlineOffset: '3px',
              }}
            >
              {NonrmlWords[Number(i % NonrmlWords.length)]}
            </span>{' '}
            <span 
              className=''
              style={{
                display: 'inline-block',
                transformOrigin: 'center',
              }}
            >
              •
            </span>{' '}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }

        @keyframes textGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes pulseUnderline {
          0%, 100% { 
            text-decoration-color: #ef4444;
            transform: scaleX(1);
          }
          50% { 
            text-decoration-color: #dc2626;
            transform: scaleX(1.05);
          }
        }

        @keyframes colorShift {
          0%, 100% { 
            color: #ef4444;
            text-shadow: 0 0 5px rgba(239, 68, 68, 0.3);
          }
          25% { 
            color: #dc2626;
            text-shadow: 0 0 8px rgba(220, 38, 38, 0.4);
          }
          50% { 
            color: #b91c1c;
            text-shadow: 0 0 10px rgba(185, 28, 28, 0.5);
          }
          75% { 
            color: #dc2626;
            text-shadow: 0 0 8px rgba(220, 38, 38, 0.4);
          }
        }

        @keyframes rotateSeparator {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>
    </div>
  );
};