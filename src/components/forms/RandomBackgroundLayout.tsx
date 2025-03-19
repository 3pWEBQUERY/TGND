"use client";

import { ReactNode, useEffect, useState } from "react";

interface RandomBackgroundLayoutProps {
  children: ReactNode;
  imageFolder: string;
  imageCount: number;
}

export function RandomBackgroundLayout({
  children,
  imageFolder,
  imageCount,
}: RandomBackgroundLayoutProps) {
  const [bgImage, setBgImage] = useState<string>(`${imageFolder}-1.jpg`);

  useEffect(() => {
    // Zufälliges Bild auswählen
    const randomImage = Math.floor(Math.random() * imageCount) + 1;
    // console.log(`Versuche Bild zu laden: ${imageFolder}-${randomImage}.jpg`);
    setBgImage(`${imageFolder}-${randomImage}.jpg`);
  }, [imageFolder, imageCount]);

  console.log(`Aktueller Bildpfad: ${bgImage}`);

  return (
    <div className="min-h-screen flex flex-col">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="fixed inset-0 bg-black/60 -z-10" />
      {children}
    </div>
  );
}
