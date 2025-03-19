import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { getCurrentUserProfile, getDefaultProfileData } from "../db/profile-service";

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getCurrentUserWithProfile() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        user: null,
        profile: getDefaultProfileData()
      };
    }

    const profile = await getCurrentUserProfile(session.user.id);
    
    return {
      user: session.user,
      profile: profile || getDefaultProfileData()
    };
  } catch (error) {
    console.error("Error getting current user with profile:", error);
    return {
      user: null,
      profile: getDefaultProfileData()
    };
  }
} 