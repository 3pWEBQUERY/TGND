import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
// UserRole Enum inline definieren, um Kompatibilität zu gewährleisten
enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  ESCORT = 'ESCORT',
  AGENCY = 'AGENCY',
  CLUB = 'CLUB',
  STUDIO = 'STUDIO'
}

interface RegisterRequestBody {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  profile?: {
    displayName?: string;
    profileImage?: string;
    location?: string;
    gender?: string;
    age?: number;
    bio?: string;
  };
}

export async function POST(request: Request) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { email, name, password, role, profile } = body;

    // Pru00fcfen, ob erforderliche Felder vorhanden sind
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { message: 'Fehlende Pflichtfelder' },
        { status: 400 }
      );
    }

    // Pru00fcfen, ob E-Mail bereits existiert
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Ein Benutzer mit dieser E-Mail existiert bereits' },
        { status: 409 }
      );
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer erstellen
    const user = await db.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role,
        profile: {
          create: {
            displayName: profile?.displayName || name,
            profileImage: profile?.profileImage,
            location: profile?.location,
            gender: profile?.gender,
            age: profile?.age,
            bio: profile?.bio,
          },
        },
      },
    });

    // Benutzerdaten ohne Passwort zuru00fcckgeben
    const { hashedPassword: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'Benutzer erfolgreich registriert',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('REGISTER_ERROR', error);
    return NextResponse.json(
      { message: 'Interner Serverfehler bei der Registrierung' },
      { status: 500 }
    );
  }
}
