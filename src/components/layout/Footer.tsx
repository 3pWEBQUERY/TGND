"use client";

import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaTwitter, FaFacebook, FaTiktok } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[hsl(var(--dark-bg))] text-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/TheGND_Logo_light.png"
                alt="TheGirlNextDoor Logo"
                width={180}
                height={60}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-zinc-400 text-sm mt-4">
              Das modernste Erotik Portal seit 2025. Entdecke eine neue Welt der Leidenschaft und Sinnlichkeit.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-zinc-400 hover:text-[hsl(var(--primary))] transition-colors">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-zinc-400 hover:text-[hsl(var(--primary))] transition-colors">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-zinc-400 hover:text-[hsl(var(--primary))] transition-colors">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-zinc-400 hover:text-[hsl(var(--primary))] transition-colors">
                <FaTiktok className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/girls" className="text-zinc-400 hover:text-white transition-colors">
                  Girls
                </Link>
              </li>
              <li>
                <Link href="/agentur" className="text-zinc-400 hover:text-white transition-colors">
                  Agentur
                </Link>
              </li>
              <li>
                <Link href="/club" className="text-zinc-400 hover:text-white transition-colors">
                  Club
                </Link>
              </li>
              <li>
                <Link href="/studio" className="text-zinc-400 hover:text-white transition-colors">
                  Studio
                </Link>
              </li>
              <li>
                <Link href="/food" className="text-zinc-400 hover:text-white transition-colors">
                  Food
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Rechtliches</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/datenschutz" className="text-zinc-400 hover:text-white transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-zinc-400 hover:text-white transition-colors">
                  AGB
                </Link>
              </li>
              <li>
                <Link href="/impressum" className="text-zinc-400 hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-zinc-400 hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Kontakt</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-zinc-400">
                E-Mail: <a href="mailto:info@thegirlnextdoor.de" className="hover:text-white transition-colors">info@thegirlnextdoor.de</a>
              </li>
              <li className="text-zinc-400">
                Telefon: <a href="tel:+490123456789" className="hover:text-white transition-colors">+49 (0) 123 456789</a>
              </li>
              <li className="text-zinc-400 mt-4">
                Erreichbarkeit: <br />
                Mo-Fr: 9:00 - 18:00 Uhr
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-400 text-sm">
            © {currentYear} TheGirlNextDoor. Alle Rechte vorbehalten.
          </p>
          <p className="text-zinc-500 text-xs mt-4 md:mt-0">
            Sie müssen mindestens 18 Jahre alt sein, um diese Website zu nutzen.
          </p>
        </div>
      </div>
    </footer>
  );
}
