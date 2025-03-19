"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type PostType = 
  | "standard" 
  | "event" 
  | "availability" 
  | "review" 
  | "update" 
  | "milestone" 
  | "offer" 
  | "poll" 
  | "travel";

interface PostTypeSelectorProps {
  selectedType: PostType;
  onTypeChange: (type: PostType) => void;
}

interface PostTypeOption {
  id: PostType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export function PostTypeSelector({ selectedType, onTypeChange }: PostTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Schließe das Dropdown, wenn außerhalb geklickt wird
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const postTypes: PostTypeOption[] = [
    {
      id: "standard",
      label: "Standard-Beitrag",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      description: "Teile Gedanken, Bilder oder Videos mit deinen Followern"
    },
    {
      id: "event",
      label: "Event",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: "Kündige ein Event oder eine Veranstaltung an"
    },
    {
      id: "availability",
      label: "Verfügbarkeit",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "Teile deine Arbeitszeiten oder wann du verfügbar bist"
    },
    {
      id: "review",
      label: "Bewertung",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      description: "Teile eine Kundenbewertung (mit Erlaubnis)"
    },
    {
      id: "update",
      label: "Update",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      description: "Teile Neuigkeiten oder Updates zu deinem Profil"
    },
    {
      id: "milestone",
      label: "Meilenstein",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      description: "Feiere ein Jubiläum oder einen besonderen Erfolg"
    },
    {
      id: "offer",
      label: "Angebot",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "Teile ein Spezialangebot oder einen Rabatt"
    },
    {
      id: "poll",
      label: "Umfrage",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      description: "Erstelle eine Umfrage, um Feedback zu erhalten"
    },
    {
      id: "travel",
      label: "Reiseplan",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: "Teile deine Reisepläne oder bevorstehende Besuche"
    }
  ];

  // Finde den aktuell ausgewählten Typ
  const currentType = postTypes.find(type => type.id === selectedType) || postTypes[0];

  return (
    <div className="relative z-[9999]" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-gray-800 dark:text-gray-200 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"
      >
        <div className="flex items-center">
          <span className="mr-4">{currentType.icon}</span>
          <span>{currentType.label}</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={() => setIsOpen(false)}></div>
          <div className="fixed z-[9999] shadow-lg max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-950 rounded-lg" style={{ 
            top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + 8 : 0, 
            left: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().left : 0,
            width: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().width : 'auto'
          }}>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-3 py-2">
                {postTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={type.id === selectedType ? "default" : "ghost"}
                    size="default"
                    className={`justify-start w-full flex items-center ${type.id === selectedType ? "bg-[hsl(345.3,82.7%,40.8%)] text-white" : "text-gray-800 dark:text-gray-200 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"}`}
                    onClick={() => {
                      onTypeChange(type.id);
                      setIsOpen(false);
                    }}
                  >
                    <span className="mr-4">{type.icon}</span>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{type.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </div>
        </>
      )}
    </div>
  );
}
