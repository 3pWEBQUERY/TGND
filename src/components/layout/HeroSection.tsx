"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  const [bgImage, setBgImage] = useState<string>("/hero/hero-bg-1.jpg");

  useEffect(() => {
    // Zufu00e4lliges Bild zwischen 1 und 7 auswu00e4hlen
    const randomImage = Math.floor(Math.random() * 7) + 1;
    setBgImage(`/hero/hero-bg-${randomImage}.jpg`);
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Overlay */}
      <div className="hero-overlay" />
      
      {/* Content */}
      <div className="hero-content">
        <h1 className="text-4xl md:text-6xl font-bold text-white max-w-3xl">
          Das modernste <span className="text-[hsl(var(--primary))]">Erotik Portal</span> seit 2025
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl">
          Entdecke eine neue Welt der Leidenschaft und Sinnlichkeit
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/girls" className="btn-primary">
            Girls entdecken
          </Link>
          <Link href="/auth/register" className="btn-outline text-white border-white hover:bg-white/10">
            Jetzt registrieren
          </Link>
        </div>
      </div>
    </section>
  );
}
