import { useState, useEffect } from 'react';

export const useBreakpoint = (breakpoint: string) => {
  const [isBreakpoint, setIsBreakpoint] = useState(false);

  useEffect(() => {
    const query = `(min-width: ${breakpoint})`;
    const mediaQueryList = window.matchMedia(query);

    const updateBreakpoint = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsBreakpoint(event.matches);
    };

    // Initial check
    updateBreakpoint(mediaQueryList);

    // Add event listener
    mediaQueryList.addEventListener('change', updateBreakpoint);

    return () => {
      mediaQueryList.removeEventListener('change', updateBreakpoint);
    };
  }, [breakpoint]);

  return isBreakpoint;
};