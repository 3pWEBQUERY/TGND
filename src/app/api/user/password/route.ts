import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";

const passwordSchema = z.object({
  userId: z.string(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/
  ),
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
    const validationResult = passwordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: "Ungu00fcltige Daten", 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { userId, currentPassword, newPassword } = validationResult.data;

    // Sicherstellen, dass der Benutzer nur sein eigenes Passwort u00e4ndern kann
    if (session.user.id !== userId) {
      return NextResponse.json(
        { message: "Nicht autorisiert fu00fcr diesen Benutzer" },
        { status: 403 }
      );
    }

    // Benutzer aus der Datenbank abrufen
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { message: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Aktuelles Passwort u00fcberpru00fcfen
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.hashedPassword
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Aktuelles Passwort ist nicht korrekt" },
        { status: 400 }
      );
    }

    // Neues Passwort hashen und speichern
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Passwort erfolgreich aktualisiert" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PASSWORD_UPDATE_ERROR", error);
    return NextResponse.json(
      { message: "Interner Serverfehler bei der Passwortaktualisierung" },
      { status: 500 }
    );
  }
}
