"use client";

import { DashboardProfile } from "@/components/dashboard/DashboardProfile";
import { StoriesSection } from "@/components/dashboard/StoriesSection";
import { PhotoFeed } from "@/components/dashboard/PhotoFeed";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useEffect, useState } from "react";
import { getDefaultProfileData } from "@/lib/db/profile-service";
import { useSession } from "next-auth/react";

// Dummy-Daten für Stories und Photos
const stories = [
  { id: "1", title: "Silent Meets", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=240&auto=format&fit=crop" },
  { id: "2", title: "Summer Echoes", image: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=240&auto=format&fit=crop" },
  { id: "3", title: "River's Story", image: "https://images.unsplash.com/photo-1516214104703-d870798883c5?q=80&w=240&auto=format&fit=crop" },
  { id: "4", title: "Love Simple", image: "https://images.unsplash.com/photo-1516917565229-e6c15d140142?q=80&w=240&auto=format&fit=crop" },
  { id: "5", title: "Paradise City", image: "https://images.unsplash.com/photo-1508739826987-b79cd8b7da12?q=80&w=240&auto=format&fit=crop" }
];

const photos = [
  { id: "1", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop", width: 4, height: 3 },
  { id: "2", image: "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?q=80&w=400&auto=format&fit=crop", width: 3, height: 4 },
  { id: "3", image: "https://images.unsplash.com/photo-1511649475669-e288648b2339?q=80&w=400&auto=format&fit=crop", width: 4, height: 3 },
  { id: "4", image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=400&auto=format&fit=crop", width: 3, height: 2 },
  { id: "5", image: "https://images.unsplash.com/photo-1550236520-7050f3582da0?q=80&w=400&auto=format&fit=crop", width: 5, height: 3 },
  { id: "6", image: "https://images.unsplash.com/photo-1502943693086-33b5b1cfdf2f?q=80&w=400&auto=format&fit=crop", width: 4, height: 3 }
];

export function DashboardContent() {
  const [activeItem, setActiveItem] = useState<string>('feed');
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(getDefaultProfileData());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Bei Seitenlade-Ereignis den aktiven Status auf 'feed' setzen
    setActiveItem('feed');
    
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
          
          {/* Rechter Bereich - Stories und Foto-Feed */}
          <div className="lg:w-3/4 w-full">
            <div className="flex flex-col gap-8">
              <StoriesSection stories={stories} />
              <PhotoFeed photos={photos} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 