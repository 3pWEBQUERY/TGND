"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-[hsl(var(--dark-bg))] shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src={isScrolled ? "/TheGND_Logo_dark.png" : "/TheGND_Logo_light.png"}
            alt="TheGirlNextDoor Logo"
            width={150}
            height={50}
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === "/"
                ? "text-[hsl(var(--primary))]"
                : "text-zinc-700 dark:text-zinc-200 hover:text-[hsl(var(--primary))]"
            }`}
          >
            Home
          </Link>
          <Link
            href="/girls"
            className={`text-sm font-medium transition-colors ${
              pathname === "/girls"
                ? "text-[hsl(var(--primary))]"
                : "text-zinc-700 dark:text-zinc-200 hover:text-[hsl(var(--primary))]"
            }`}
          >
            Girls
          </Link>
          <Link
            href="/agentur"
            className={`text-sm font-medium transition-colors ${
              pathname === "/agentur"
                ? "text-[hsl(var(--primary))]"
                : "text-zinc-700 dark:text-zinc-200 hover:text-[hsl(var(--primary))]"
            }`}
          >
            Agentur
          </Link>
          <Link
            href="/club"
            className={`text-sm font-medium transition-colors ${
              pathname === "/club"
                ? "text-[hsl(var(--primary))]"
                : "text-zinc-700 dark:text-zinc-200 hover:text-[hsl(var(--primary))]"
            }`}
          >
            Club
          </Link>
          <Link
            href="/studio"
            className={`text-sm font-medium transition-colors ${
              pathname === "/studio"
                ? "text-[hsl(var(--primary))]"
                : "text-zinc-700 dark:text-zinc-200 hover:text-[hsl(var(--primary))]"
            }`}
          >
            Studio
          </Link>
          <Link
            href="/food"
            className={`text-sm font-medium transition-colors ${
              pathname === "/food"
                ? "text-[hsl(var(--primary))]"
                : "text-zinc-700 dark:text-zinc-200 hover:text-[hsl(var(--primary))]"
            }`}
          >
            Food
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {status === 'authenticated' && session ? (
            <Link
              href="/dashboard"
              className="btn-outline text-sm"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:text-[hsl(var(--primary))] transition-colors"
              >
                Anmelden
              </Link>
              <Link
                href="/auth/register"
                className="btn-primary text-sm"
              >
                Registrieren
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-zinc-700 dark:text-zinc-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <FaTimes className="h-6 w-6" />
          ) : (
            <FaBars className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 px-4 py-6 absolute top-full left-0 right-0 shadow-md">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className={`text-base font-medium transition-colors ${
                pathname === "/"
                  ? "text-[hsl(var(--primary))]"
                  : "text-zinc-700 dark:text-zinc-200"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/girls"
              className={`text-base font-medium transition-colors ${
                pathname === "/girls"
                  ? "text-[hsl(var(--primary))]"
                  : "text-zinc-700 dark:text-zinc-200"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Girls
            </Link>
            <Link
              href="/agentur"
              className={`text-base font-medium transition-colors ${
                pathname === "/agentur"
                  ? "text-[hsl(var(--primary))]"
                  : "text-zinc-700 dark:text-zinc-200"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Agentur
            </Link>
            <Link
              href="/club"
              className={`text-base font-medium transition-colors ${
                pathname === "/club"
                  ? "text-[hsl(var(--primary))]"
                  : "text-zinc-700 dark:text-zinc-200"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Club
            </Link>
            <Link
              href="/studio"
              className={`text-base font-medium transition-colors ${
                pathname === "/studio"
                  ? "text-[hsl(var(--primary))]"
                  : "text-zinc-700 dark:text-zinc-200"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Studio
            </Link>
            <Link
              href="/food"
              className={`text-base font-medium transition-colors ${
                pathname === "/food"
                  ? "text-[hsl(var(--primary))]"
                  : "text-zinc-700 dark:text-zinc-200"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Food
            </Link>
            <div className="pt-4 flex flex-col space-y-4">
              {status === 'authenticated' && session ? (
                <Link
                  href="/dashboard"
                  className="btn-outline text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="btn-outline text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Anmelden
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrieren
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
