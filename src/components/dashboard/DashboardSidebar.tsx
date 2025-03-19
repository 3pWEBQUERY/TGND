"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

export function DashboardSidebar({ activeItem = 'feed', onItemClick }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState<string>(activeItem);

  useEffect(() => {
    // Aktualisiere den aktiven Status, wenn sich das activeItem-Prop ändert
    setActive(activeItem);
  }, [activeItem]);

  // Bestimme den aktiven Menüpunkt basierend auf dem Pfad
  useEffect(() => {
    if (pathname === '/dashboard') setActive('feed');
    else if (pathname === '/dashboard/profile') setActive('explore');
    else if (pathname === '/dashboard/newsfeed') setActive('trending');
    else if (pathname === '/dashboard/stories') setActive('people');
    else if (pathname === '/dashboard/notifications') setActive('notifications');
    else if (pathname === '/dashboard/messages') setActive('direct');
    else if (pathname === '/dashboard/settings') setActive('stats');
  }, [pathname]);

  const handleClick = (item: string, path: string) => {
    setActive(item);
    router.push(path);
    
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <aside className="w-16 fixed left-0 top-0 h-screen bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-gray-800 z-20 flex flex-col items-center">
      {/* TheGirlNextDoor Logo */}
      <div className="py-5">
        <Link href="/" className="relative flex items-center justify-center w-10 h-10">
          <Image 
            src="/TheGND_Icon.png" 
            alt="TheGirlNextDoor" 
            width={40} 
            height={40} 
            className="w-full h-full object-contain"
            priority
          />
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col items-center space-y-6 py-8">
        {/* Feed */}
        <div className="relative group">
          <button
            onClick={() => handleClick('feed', '/dashboard')}
            className={`p-2 rounded-lg transition-all duration-200 
              ${active === 'feed' 
                ? 'text-white bg-[hsl(345.3,82.7%,40.8%)]' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            Feed
          </div>
        </div>

        {/* Mein Profil */}
        <div className="relative group">
          <button
            onClick={() => handleClick('explore', '/dashboard/profile')}
            className={`p-2 rounded-lg transition-all duration-200 
              ${active === 'explore' 
                ? 'text-white bg-[hsl(345.3,82.7%,40.8%)]' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            Mein Profil
          </div>
        </div>

        {/* Newsfeed */}
        <div className="relative group">
          <button
            onClick={() => handleClick('trending', '/dashboard/newsfeed')}
            className={`p-2 rounded-lg transition-all duration-200 
              ${active === 'trending' 
                ? 'text-white bg-[hsl(345.3,82.7%,40.8%)]' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </button>
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            Newsfeed
          </div>
        </div>

        {/* Stories */}
        <div className="relative group">
          <button
            onClick={() => handleClick('people', '/dashboard/stories')}
            className={`p-2 rounded-lg transition-all duration-200 
              ${active === 'people' 
                ? 'text-white bg-[hsl(345.3,82.7%,40.8%)]' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            Stories
          </div>
        </div>

        {/* Benachrichtigungen */}
        <div className="relative group">
          <button
            onClick={() => handleClick('notifications', '/dashboard/notifications')}
            className={`p-2 rounded-lg transition-all duration-200 
              ${active === 'notifications' 
                ? 'text-white bg-[hsl(345.3,82.7%,40.8%)]' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            Benachrichtigungen
          </div>
        </div>

        {/* Nachrichten */}
        <div className="relative group">
          <button
            onClick={() => handleClick('direct', '/dashboard/messages')}
            className={`p-2 rounded-lg transition-all duration-200 
              ${active === 'direct' 
                ? 'text-white bg-[hsl(345.3,82.7%,40.8%)]' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            Nachrichten
          </div>
        </div>

        {/* Einstellungen */}
        <div className="relative group">
          <button
            onClick={() => handleClick('stats', '/dashboard/settings')}
            className={`p-2 rounded-lg transition-all duration-200 
              ${active === 'stats' 
                ? 'text-white bg-[hsl(345.3,82.7%,40.8%)]' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            Einstellungen
          </div>
        </div>
      </nav>
    </aside>
  );
}
