import { db } from "../db";

export async function getCurrentUserProfile(userId: string) {
  try {
    const profile = await db.profile.findUnique({
      where: {
        userId: userId
      },
      include: {
        user: true
      }
    });

    return profile;
  } catch (error) {
    console.error("Fehler beim Abrufen des Profils:", error);
    return null;
  }
}

export async function getUserProfile(profileId: string) {
  try {
    const profile = await db.profile.findUnique({
      where: {
        id: profileId
      },
      include: {
        user: true
      }
    });

    return profile;
  } catch (error) {
    console.error("Fehler beim Abrufen des Profils:", error);
    return null;
  }
}

// Fallback-Daten für Entwicklungs- und Testzwecke
export const getDefaultProfileData = () => {
  return {
    id: "default",
    userId: "default",
    displayName: "Karry Woodson",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
    location: "Paris, France",
    bio: "Leverage agile frameworks to provide a robust synopsis for high level of the overview. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition.",
    gender: "female",
    age: 28,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: "default",
      name: "Karry Woodson",
      email: "karry@example.com",
      role: "ESCORT"
    }
  };
}; 