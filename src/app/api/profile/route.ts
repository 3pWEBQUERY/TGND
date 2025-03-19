import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().min(2).max(50),
  phoneNumber: z.string().optional(),
  location: z.string().min(2).optional(),
  gender: z.string().optional(),
  age: z.number().min(18).max(100).optional(),
  bio: z.string().max(500).optional(),
});

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = profileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: "Ungu00fcltige Daten", 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Pru00fcfen, ob ein Profil existiert
    const existingProfile = await db.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    let profile;

    if (existingProfile) {
      // Aktualisieren des bestehenden Profils
      profile = await db.profile.update({
        where: {
          userId: session.user.id,
        },
        data: {
          displayName: data.displayName,
          phoneNumber: data.phoneNumber,
          location: data.location,
          gender: data.gender,
          age: data.age,
          bio: data.bio,
        },
      });
    } else {
      // Erstellen eines neuen Profils
      profile = await db.profile.create({
        data: {
          userId: session.user.id,
          displayName: data.displayName,
          phoneNumber: data.phoneNumber,
          location: data.location,
          gender: data.gender,
          age: data.age,
          bio: data.bio,
        },
      });
    }

    return NextResponse.json(
      { message: "Profil erfolgreich aktualisiert", profile },
      { status: 200 }
    );
  } catch (error) {
    console.error("PROFILE_ERROR", error);
    return NextResponse.json(
      { message: "Interner Serverfehler bei der Profilaktualisierung" },
      { status: 500 }
    );
  }
}
