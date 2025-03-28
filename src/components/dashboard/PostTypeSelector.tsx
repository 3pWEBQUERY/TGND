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
  selected: PostType;
  onSelect: (type: PostType) => void;
  onPollCreate?: () => void;
}

interface PostTypeOption {
  id: PostType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export function PostTypeSelector({ selected, onSelect, onPollCreate }: PostTypeSelectorProps) {
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
      id: "poll",
      label: "Umfrage",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      description: "Erstelle eine Umfrage für deine Follower"
    }
  ];

  const handleTypeSelect = (type: PostType) => {
    if (type === "poll" && onPollCreate) {
      onPollCreate();
    } else {
      onSelect(type);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          {postTypes.find(type => type.id === selected)?.icon}
          {postTypes.find(type => type.id === selected)?.label}
        </span>
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
        <Card className="absolute z-50 w-full mt-2">
          <CardContent className="p-2">
            {postTypes.map((type) => (
              <Button
                key={type.id}
                variant="ghost"
                className="w-full justify-start gap-2 mb-1"
                onClick={() => handleTypeSelect(type.id)}
              >
                {type.icon}
                <div className="text-left">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
