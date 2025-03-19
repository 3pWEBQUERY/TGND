"use client";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardProfile } from "@/components/dashboard/DashboardProfile";
import { NewsFeedContent } from "@/components/dashboard/NewsFeedContent";
import { getDefaultProfileData } from "@/lib/db/profile-service";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

// Metadaten können in Client-Komponenten nicht verwendet werden
// Stattdessen können wir den Titel mit document.title setzen
// oder eine separate Metadaten-Komponente verwenden

// Wrapper-Komponente für das Dashboard-Layout mit Newsfeed-Inhalt
function NewsFeedWithDashboard() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(getDefaultProfileData());
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<string>('trending');
  
  // Bei Seitenlade-Ereignis den aktiven Status auf 'trending' setzen und Profildaten laden
  useEffect(() => {
    setActiveItem('trending');
    
    // Profildaten laden
    const loadProfileData = async () => {
      setIsLoading(true);
      
      try {
        // Für den Fall, dass wir keine Session haben, verwenden wir die Default-Daten
        if (!session?.user?.id) {
          setProfile(getDefaultProfileData());
          return;
        }
        
        // API-Route aufrufen, um das Profil zu laden
        const response = await fetch(`/api/profile/current`);
        
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile || getDefaultProfileData());
        } else {
          setProfile(getDefaultProfileData());
        }
      } catch (error) {
        console.error("Fehler beim Laden des Profils:", error);
        setProfile(getDefaultProfileData());
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfileData();
  }, [session]);

  const handleSidebarItemClick = (item: string) => {
    setActiveItem(item);
  };

  // Benutzerprofilinformationen für das Dashboard aufbereiten
  const profileData = {
    name: profile.displayName || "Unbenannter Benutzer",
    username: session?.user?.name || "user",
    location: profile.location || "Keine Angabe",
    avatar: profile.profileImage || "/TheGND_Icon.png", // Fallback auf das App-Icon
    stats: {
      posts: 0, // Diese Werte sollten später aus der Datenbank kommen
      followers: 0,
      following: 0
    },
    bio: profile.bio || "Keine Beschreibung vorhanden",
    tags: ["TheGirlNextDoor"], // Diese Werte sollten später aus der Datenbank kommen
    activity: profile.gender || "Keine Angabe",
    favoriteProfiles: [] // Diese Werte sollten später aus der Datenbank kommen
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
      <DashboardSidebar 
        activeItem={activeItem} 
        onItemClick={handleSidebarItemClick} 
      />
      
      <main className="flex-1 ml-16 p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Linker Bereich - Profil */}
          <div className="lg:w-1/4 w-full">
            <DashboardProfile profileData={profileData} isLoading={isLoading} />
          </div>
          
          {/* Rechter Bereich - Newsfeed */}
          <div className="lg:w-3/4 w-full">
            <NewsFeedContent />
          </div>
        </div>
      </main>
    </div>
  );
}

// Server-Komponente, die die Client-Komponente rendert
export default function NewsFeedPage() {
  return (
    <>
      <NewsFeedWithDashboard />
    </>
  );
}
