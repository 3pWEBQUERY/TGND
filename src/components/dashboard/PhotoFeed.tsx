"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { 
  CarouselApi
} from "@/components/ui/carousel";

interface Photo {
  id: string;
  image: string;
  width?: number;
  height?: number;
}

interface PhotoFeedProps {
  photos: Photo[];
}

export function PhotoFeed({ photos }: PhotoFeedProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section>
      <div className="flex items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Photo Feed</h2>
      </div>
      
      {/* Mobile hint */}
      {isMobile && (
        <div className="flex items-center justify-center mb-2 text-xs text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>Wischen zum Navigieren</span>
        </div>
      )}
      
      {/* Photo Carousel */}
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
          containScroll: false,
        }}
        setApi={setApi}
        className="w-full touch-pan-y"
      >
        <CarouselContent>
          {photos.map((photo) => {
            const aspectRatio = photo.width && photo.height
              ? `aspect-[${photo.width}/${photo.height}]`
              : "aspect-video";
              
            return (
              <CarouselItem key={photo.id} className="md:basis-1/2 lg:basis-1/3 basis-1 pl-2 md:pl-4">
                <div className={`${aspectRatio} rounded-lg overflow-hidden shadow-sm group cursor-pointer bg-black`}>
                  <img 
                    src={photo.image} 
                    alt="Photo" 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105 opacity-95"
                    loading="lazy"
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        {/* Navigation buttons - visible only on desktop */}
        <div className="hidden md:block">
          <CarouselPrevious className="absolute -left-4 top-1/2 transform -translate-y-1/2" />
          <CarouselNext className="absolute -right-4 top-1/2 transform -translate-y-1/2" />
        </div>
      </Carousel>
      
      {/* Indicator dots for mobile */}
      {isMobile && count > 0 && (
        <div className="flex justify-center mt-3 space-x-1">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === current ? "bg-pink-600" : "bg-gray-300 dark:bg-gray-700"
              }`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
} 