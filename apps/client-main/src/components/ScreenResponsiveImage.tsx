"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export const ResponsiveProductImage = ({ imageMd, imageLg } : { imageMd: string, imageLg: string}) => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  
  useEffect(() => {
    // Function to check screen size and update state
    const checkScreenSize = () => {
      // Tailwind's lg breakpoint is typically 1024px
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    // Check on initial render
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up event listener on component unmount
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return (
    <div className="z-30 relative w-full">
        <Image 
          src={isLargeScreen ? imageLg : imageMd }
          alt={"Product Image"} 
          className="object-cover w-full h-full" 
          width={1000} 
          height={1000}
        />
    </div>
  );
};

export const ResponsiveImageGallery = ({ images }: { images: string[]}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  
  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      // Tailwind's md breakpoint is typically 768px
      setIsLargeScreen(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Auto rotate images with timer
  useEffect(() => {
    if (!isLargeScreen) {
      const timer = setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 8000); // 3 seconds timer
      
      return () => clearTimeout(timer);
    }
  }, [currentImageIndex, isLargeScreen, images.length]);
  
  // Handle dot click
  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };
  
  // Mobile view carousel
  const renderCarousel = () => (
    <div className="relative">
      <div className="overflow-hidden">
        <Image 
          src={images[currentImageIndex]}
          alt={images[currentImageIndex] || "Product Image"}
          className="object-cover w-full h-full transition-opacity duration-1000"
          width={400}
          height={400}
        />
      </div>
      
      {/* Dots navigation */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-red-500' : 'bg-white'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
  
  // Desktop view with all images in a row
  const renderDesktopGallery = () => (
    <div className="flex flex-row bg-white">
      {images.map((image, index) => (
        <div key={index} className="flex-1">
          <Image 
            src={image} 
            alt={image || "Product Image"} 
            className="object-cover w-full h-auto p-1" 
            width={1000} 
            height={1000}
          />
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="z-30 relative p-1 bg-white">
      {isLargeScreen ? renderDesktopGallery() : renderCarousel()}
    </div>
  );
};


interface ResponsiveImageProps {
  images: {
    md: string;
    lg: string;
  };
  lgBreakpoint?: number;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  images,
  lgBreakpoint = 1024,
  alt,
  className = "",
  fill = false,
  priority = false,
  sizes = "100vw",
  quality = 80,
}) => {
  // Default to md image initially
  const [currentSrc, setCurrentSrc] = useState<string>(images.md);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    // Set isClient to true when component mounts
    setIsClient(true);

    // Set initial image based on window width
    if (typeof window !== "undefined") {
      setCurrentSrc(window.innerWidth >= lgBreakpoint ? images.lg : images.md);
    }

    // Function to handle window resize
    const handleResize = () => {
      if (window.innerWidth >= lgBreakpoint) {
        setCurrentSrc(images.lg);
      } else {
        setCurrentSrc(images.md);
      }
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [images.md, images.lg, lgBreakpoint]);

  // If we're server-side rendering, just return the md image
  if (!isClient) {
    return (
      <Image
        src={images.md}
        alt={alt}
        className={`object-cover object-center ${className}`}
        fill={fill}
        width={100}
        height={100}
        priority={priority}
        sizes={sizes}
        quality={quality}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      className={`object-cover object-center ${className}`}
      width={100}
      fill={fill}
      height={100}
      priority={priority}
      sizes={sizes}
      quality={quality}
    />
  );
};

export default ResponsiveImage;