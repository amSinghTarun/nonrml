"use client"

import { useEffect } from "react";

/**
 * Sets a CSS custom property --vh to the actual viewport height on mount.
 * This value stays locked and doesn't change when mobile browser chrome shows/hides.
 * Use `calc(var(--vh, 1vh) * 100)` instead of `100vh` for stable full-height sections.
 */
export default function StableViewport() {
  useEffect(() => {
    function setVH() {
      // Only set once on initial load — don't update on resize
      // This prevents the jump when browser chrome appears/disappears
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    }

    setVH();

    // Only re-calculate on orientation change (actual device rotation), not on resize
    // Resize fires when mobile chrome shows/hides — we want to ignore that
    function handleOrientationChange() {
      // Small delay to let the browser settle after rotation
      setTimeout(setVH, 150);
    }

    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  return null;
}
