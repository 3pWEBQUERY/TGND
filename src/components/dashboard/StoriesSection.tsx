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

interface StoryItem {
  id: string;
  title: string;
  image: string;
}

interface StoriesSectionProps {
  stories: StoryItem[];
}

export function StoriesSection({ stories }: StoriesSectionProps) {
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
    <section className="mb-8">
      {/* Header mit Titel */}
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Meine Stories</h2>
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
      
      {/* Desktop Grid View - Genau 5 Stories */}
      <div className="hidden md:block">
        <div className="grid grid-cols-5 gap-4">
          {/* Story erstellen Card */}
          <div className="relative group cursor-pointer">
            <div className="h-64 rounded-lg overflow-hidden bg-[hsl(345.3,82.7%,40.8%)] flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[hsl(345.3,82.7%,40.8%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xs font-medium text-white">Story erstellen</span>
            </div>
          </div>
          
          {/* Reguläre Stories */}
          {stories.slice(0, 4).map((story) => (
            <div key={story.id} className="relative group cursor-pointer">
              <div className="h-64 rounded-lg overflow-hidden bg-black">
                <img 
                  src={story.image} 
                  alt={story.title} 
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105 opacity-95"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                  <span className="text-xs font-medium text-white shadow-sm">{story.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile Carousel View */}
      <div className="md:hidden">
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
            {/* Story erstellen Card - Mobile */}
            <CarouselItem className="basis-1/2 min-w-[45%] pl-2">
              <div className="relative group cursor-pointer h-64 rounded-lg overflow-hidden bg-[hsl(345.3,82.7%,40.8%)] flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[hsl(345.3,82.7%,40.8%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-white">Story erstellen</span>
              </div>
            </CarouselItem>
            
            {/* Reguläre Stories - Mobile */}
            {stories.map((story) => (
              <CarouselItem key={story.id} className="basis-1/2 min-w-[45%] pl-2">
                <div className="relative group cursor-pointer h-64 rounded-lg overflow-hidden bg-black">
                  <img 
                    src={story.image} 
                    alt={story.title} 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105 opacity-95"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                    <span className="text-xs font-medium text-white shadow-sm">{story.title}</span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Indicator dots for mobile */}
          {count > 0 && (
            <div className="flex justify-center mt-3 space-x-1">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === current ? "bg-[hsl(345.3,82.7%,40.8%)]" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </Carousel>
      </div>
    </section>
  );
} 