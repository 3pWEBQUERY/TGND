"use client";

import { useEffect, useState } from "react";

interface BackgroundImageProps {
  imageFolder: string;
  imageCount: number;
  className?: string;
}

export function BackgroundImage({ imageFolder, imageCount, className = "" }: BackgroundImageProps) {
  const [bgImage, setBgImage] = useState<string>(``);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Zufälliges Bild auswählen
    const randomImage = Math.floor(Math.random() * imageCount) + 1;
    const imagePath = `${imageFolder}-${randomImage}.jpg`;
    console.log(`Versuche Bild zu laden: ${imagePath}`);
    
    // Prüfen, ob das Bild geladen werden kann
    const img = new Image();
    img.onload = () => {
      console.log(`Bild erfolgreich geladen: ${imagePath}`);
      setBgImage(imagePath);
      setIsLoaded(true);
    };
    img.onerror = () => {
      console.error(`Fehler beim Laden des Bildes: ${imagePath}`);
      // Fallback auf ein Standard-Bild
      setBgImage('/hero/hero-bg-1.jpg');
      setIsLoaded(true);
    };
    img.src = imagePath;
  }, [imageFolder, imageCount]);

  if (!isLoaded) {
    return <div className={`bg-gray-900 ${className}`} />;
  }

  return (
    <div
      className={`bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${className}`}
      style={{ backgroundImage: `url(${bgImage})` }}
    />
  );
}
