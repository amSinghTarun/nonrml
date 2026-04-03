"use client"

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollManifesto() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const noX = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const normalX = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const smallTextOpacity = useTransform(scrollYProgress, [0.15, 0.35], [0, 1]);

  // NO fill: clips from left to right as you scroll
  const noFillPercent = useTransform(scrollYProgress, [0.23, 0.95], [0, 100]);
  const noClipPath = useTransform(noFillPercent, (v) => `inset(0 ${100 - v}% 0 0)`);

  return (
    <section
      ref={containerRef}
      className="z-30 relative text-black overflow-hidden select-none bg-white"
    >
      {/* === Animated mesh gradient background === */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Orb 1 — deep red, slow drift */}
        <div
          className="absolute w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, #dc2626 0%, transparent 70%)",
            top: "10%",
            left: "-5%",
            animation: "orbFloat1 18s ease-in-out infinite",
          }}
        />
        {/* Orb 2 — warm amber, counter-drift */}
        <div
          className="absolute w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #b45309 0%, transparent 70%)",
            bottom: "5%",
            right: "-5%",
            animation: "orbFloat2 22s ease-in-out infinite",
          }}
        />
        {/* Orb 3 — cool subtle purple, adds depth */}
        <div
          className="absolute w-[35vw] h-[35vw] max-w-[350px] max-h-[350px] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "orbFloat3 25s ease-in-out infinite",
          }}
        />

        {/* Fine diagonal lines pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 4px,
              rgba(255,255,255,0.5) 4px,
              rgba(255,255,255,0.5) 5px
            )`,
          }}
        />

        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative py-6 sm:py-8">
        <motion.p
          className="text-sm sm:text-base md:text-lg tracking-[0.2em] uppercase text-red-500 font-black italic px-4 sm:px-8 md:px-12 mb-1"
          style={{ opacity: smallTextOpacity }}
        >
          All it takes is a
        </motion.p>

        <motion.div className="relative" style={{ x: noX }}>
          {/* Outlined NO — always visible */}
          <h2
            className="text-[30vw] sm:text-[28vw] md:text-[25vw] font-black leading-[0.8] tracking-tighter text-transparent"
            style={{ WebkitTextStroke: "2.5px rgba(0,0,0,0.25)" }}
          >
            NO
          </h2>
          {/* Filled NO — clips in from left on scroll */}
          <motion.h2
            className="text-[30vw] sm:text-[28vw] md:text-[25vw] font-black leading-[0.8] tracking-tighter text-neutral-900 absolute inset-0"
            style={{ clipPath: noClipPath }}
            aria-hidden
          >
            NO
          </motion.h2>
          <div className="absolute top-1/2 -left-[100vw] -right-[100vw] h-[3px] sm:h-[4px] bg-red-500 -translate-y-1/2" />
        </motion.div>

        <motion.p
          className="text-sm sm:text-base md:text-lg tracking-[0.2em] uppercase text-red-500 font-black italic text-right px-4 sm:px-8 md:px-12 my-1"
          style={{ opacity: smallTextOpacity }}
        >
          To redefine what is
        </motion.p>

        <motion.div className="relative" style={{ x: normalX }}>
          <h2
            className="text-[26vw] sm:text-[24vw] md:text-[22vw] font-black leading-[0.8] tracking-tighter text-right text-transparent"
            style={{ WebkitTextStroke: "2.5px rgba(0,0,0,0.25)" }}
          >
            NORMAL
          </h2>
          <div className="absolute bottom-[15%] right-[2%] w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
        </motion.div>
      </div>

      {/* Keyframes for orb animations */}
      <style jsx>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15%, 10%) scale(1.1); }
          66% { transform: translate(-5%, -8%) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-12%, -8%) scale(1.05); }
          66% { transform: translate(8%, 12%) scale(0.9); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          33% { transform: translate(-40%, -60%) scale(1.15); }
          66% { transform: translate(-60%, -40%) scale(0.9); }
        }
      `}</style>
    </section>
  );
}
