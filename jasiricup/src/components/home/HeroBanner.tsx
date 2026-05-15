// src/components/home/HeroBanner.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface BannerPost {
  id: string;
  imageSrc: string;
  title: string;
  description: string;
  linkHref: string;
}

export const HeroBanner = ({ banners }: { banners: BannerPost[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!mounted) return null; // Prevent hydration flash on the image

  const currentBanner = banners[currentIndex];
  if (!currentBanner) return null;

  return (
    <section className="relative bg-gray-100 dark:bg-gray-800/50 rounded-lg mb-6 overflow-hidden transition-colors duration-300">
      <div className="p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
        <div className="w-full lg:w-2/3 text-center lg:text-left order-2 lg:order-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white leading-tight transition-colors duration-300">
            {currentBanner.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed transition-colors duration-300">
            {currentBanner.description}
          </p>
          <Link href={currentBanner.linkHref} passHref>
            <button className="bg-violet-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors">
              Read More
            </button>
          </Link>
        </div>
        
        <div className="w-full lg:w-1/3 flex justify-center lg:justify-end order-1 lg:order-2">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[280px] aspect-square rounded-lg shadow-lg overflow-hidden">
            <Image 
              src={currentBanner.imageSrc} 
              alt={currentBanner.title} 
              fill 
              style={{ objectFit: 'cover' }} 
              priority={currentIndex === 0} 
              sizes="(max-width: 768px) 280px, 280px" 
              className="rounded-lg" 
            />
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center space-x-2 pb-4 sm:pb-6">
          {banners.map((_, index) => (
            <button 
              key={index} 
              onClick={() => setCurrentIndex(index)} 
              className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-violet-600 dark:bg-purple-400' : 'bg-gray-400 dark:bg-gray-600'}`} 
              aria-label={`Go to slide ${index + 1}`} 
            />
          ))}
        </div>
      )}
    </section>
  );
};