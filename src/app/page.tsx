"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/layout/HeroSection";
import Link from "next/link";

// Verhindert statisches Rendering
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Warum <span className="text-[hsl(var(--primary))]">TheGirlNextDoor</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-lg p-6 bg-zinc-50 dark:bg-zinc-800 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))/10] flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sicherheit & Diskretion</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Ihre Privatsphu00e4re ist unser hu00f6chstes Gut. Alle Daten werden verschlu00fcsselt und mit hu00f6chsten Sicherheitsstandards geschu00fctzt.
              </p>
            </div>
            
            <div className="rounded-lg p-6 bg-zinc-50 dark:bg-zinc-800 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))/10] flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Vielfu00e4ltiges Angebot</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Von Escort-Services u00fcber Clubs bis hin zu Studios - bei uns finden Sie genau das, wonach Sie suchen.
              </p>
            </div>
            
            <div className="rounded-lg p-6 bg-zinc-50 dark:bg-zinc-800 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))/10] flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Verfu00fcgbarkeit</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Unsere Plattform ist rund um die Uhr erreichbar. Finden Sie jederzeit das passende Erlebnis.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-[hsl(var(--primary))]">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Bereit fu00fcr neue Erfahrungen?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Registrieren Sie sich jetzt kostenlos und entdecken Sie eine Welt voller Leidenschaft.
          </p>
          <Link href="/auth/register" className="inline-block bg-white text-[hsl(var(--primary))] px-8 py-3 rounded-md font-medium hover:bg-white/90 transition-colors">
            Kostenlos Registrieren
          </Link>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
