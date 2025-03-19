"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  thumbnail?: string;
}

interface MediaGalleryProps {
  media: MediaItem[];
  editable?: boolean;
  onRemove?: (id: string) => void;
  onReorder?: (newOrder: MediaItem[]) => void;
  className?: string;
}

export function MediaGallery({ 
  media, 
  editable = false, 
  onRemove, 
  onReorder,
  className = "" 
}: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Wenn keine Medien vorhanden sind, zeige nichts an
  if (!media || media.length === 0) {
    return null;
  }

  // Wenn nur ein Medium vorhanden ist, zeige es ohne Karussell an
  if (media.length === 1) {
    const item = media[0];
    return (
      <div className={`relative rounded-lg overflow-hidden ${className}`}>
        {item.type === "image" ? (
          <img 
            src={item.url} 
            alt="Medieninhalt" 
            className="w-full h-full object-cover"
            onClick={() => setIsFullscreen(true)}
          />
        ) : (
          <video 
            src={item.url} 
            controls 
            className="w-full h-full object-cover"
            poster={item.thumbnail}
          />
        )}
        
        {editable && onRemove && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
            onClick={() => onRemove(item.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>
    );
  }

  // Mehrere Medien - zeige Karussell an
  return (
    <div className={`relative ${className}`}>
      <Carousel
        className="w-full"
        opts={{
          align: "start",
        }}
        setApi={(api) => {
          api?.on("select", () => {
            setActiveIndex(api.selectedScrollSnap());
          });
        }}
      >
        <CarouselContent>
          {media.map((item, index) => (
            <CarouselItem key={item.id}>
              <div className="relative rounded-lg overflow-hidden aspect-video">
                {item.type === "image" ? (
                  <img 
                    src={item.url} 
                    alt={`Bild ${index + 1}`} 
                    className="w-full h-full object-cover"
                    onClick={() => setIsFullscreen(true)}
                  />
                ) : (
                  <video 
                    src={item.url} 
                    controls 
                    className="w-full h-full object-cover"
                    poster={item.thumbnail}
                  />
                )}
                
                {editable && onRemove && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
                    onClick={() => onRemove(item.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="hidden sm:block">
          <CarouselPrevious className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-[hsl(345.3,82.7%,40.8%)] text-white border-none hover:bg-[hsl(345.3,82.7%,35%)] hover:text-white" />
          <CarouselNext className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-[hsl(345.3,82.7%,40.8%)] text-white border-none hover:bg-[hsl(345.3,82.7%,35%)] hover:text-white" />
        </div>
      </Carousel>
      
      {/* Thumbnails/Indikatoren */}
      <div className="flex justify-center mt-2 space-x-1">
        {media.map((item, index) => (
          <button
            key={item.id}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === activeIndex ? "bg-[hsl(345.3,82.7%,40.8%)]" : "bg-gray-300 dark:bg-gray-700"
            }`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Gehe zu Bild ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Fullscreen-Ansicht */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center" onClick={() => setIsFullscreen(false)}>
          <div className="relative max-w-4xl max-h-screen p-4">
            <img 
              src={media[activeIndex].url} 
              alt="Vollbildansicht" 
              className="max-w-full max-h-[90vh] object-contain"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-white rounded-full w-10 h-10 p-0"
              onClick={() => setIsFullscreen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
            
            {media.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white rounded-full w-10 h-10 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white rounded-full w-10 h-10 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Komponente für das Hochladen von Medien
interface MediaUploaderProps {
  onUpload: (files: File[]) => void;
  isUploading?: boolean;
  maxFiles?: number;
  acceptedTypes?: string;
}

export function MediaUploader({ 
  onUpload, 
  isUploading = false, 
  maxFiles = 10,
  acceptedTypes = "image/*,video/*"
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      
      // Filtere nach akzeptierten Dateitypen
      const validFiles = filesArray
        .filter(file => {
          const fileType = file.type;
          const isImage = fileType.startsWith("image/");
          const isVideo = fileType.startsWith("video/");
          return isImage || isVideo;
        })
        .slice(0, maxFiles);
      
      if (validFiles.length > 0) {
        onUpload(validFiles);
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // Filtere nach akzeptierten Dateitypen
      const validFiles = filesArray
        .filter(file => {
          const fileType = file.type;
          const isImage = fileType.startsWith("image/");
          const isVideo = fileType.startsWith("video/");
          return isImage || isVideo;
        })
        .slice(0, maxFiles);
      
      if (validFiles.length > 0) {
        onUpload(validFiles);
      }
    }
  };
  
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging 
          ? 'border-[hsl(345.3,82.7%,40.8%)] bg-[hsl(345.3,82.7%,40.8%)]/10' 
          : 'border-gray-300 dark:border-gray-700 hover:border-[hsl(345.3,82.7%,40.8%)]'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <div className="flex flex-col items-center">
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Wird hochgeladen...</p>
        </div>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          <p className="text-sm font-medium mb-1">Dateien hier ablegen oder klicken zum Hochladen</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Unterstützt werden Bilder und Videos (max. {maxFiles} Dateien)
          </p>
          <div className="relative">
            <input
              type="file"
              id="media-upload"
              multiple
              accept={acceptedTypes}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="cursor-pointer hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white relative z-0"
              type="button"
            >
              Dateien auswählen
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
