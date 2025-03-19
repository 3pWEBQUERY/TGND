import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { getDefaultProfileData } from "@/lib/db/profile-service";

export async function GET(request: NextRequest) {
  try {
    // Die aktuelle Session abrufen
    const session = await getServerSession(authOptions);
    
    // Wenn kein Benutzer angemeldet ist, gib einen Fehler zurück
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht authentifiziert", profile: getDefaultProfileData() },
        { status: 401 }
      );
    }
    
    // Das Profil des angemeldeten Benutzers abrufen
    const profile = await db.profile.findUnique({
      where: {
        userId: session.user.id
      }
    });
    
    // Wenn kein Profil existiert, erstelle ein neues
    if (!profile) {
      // Erstelle ein neues Profil für den Benutzer
      const newProfile = await db.profile.create({
        data: {
          userId: session.user.id,
          displayName: session.user.name || "Unbenannter Benutzer",
          profileImage: session.user.image || ""
        }
      });
      
      return NextResponse.json({ profile: newProfile }, { status: 200 });
    }
    
    // Erfolgreich das Profil zurückgeben
    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("Fehler beim Abrufen des Profils:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler", profile: getDefaultProfileData() },
      { status: 500 }
    );
  }
} 