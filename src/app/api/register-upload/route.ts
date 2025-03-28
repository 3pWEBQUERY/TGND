import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei gefunden' },
        { status: 400 }
      );
    }

    // Überprüfe den Dateityp
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Nur Bilddateien sind erlaubt' },
        { status: 400 }
      );
    }

    // Überprüfe die Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Die Datei darf nicht größer als 5MB sein' },
        { status: 400 }
      );
    }

    // Generiere einen eindeutigen Dateinamen
    const uniqueFileName = `profile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${path.extname(file.name)}`;
    
    // Erstelle den vollständigen Pfad
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profile-images');
    const filePath = path.join(uploadDir, uniqueFileName);

    // Konvertiere die File in einen Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Speichere die Datei
    await writeFile(filePath, buffer);

    // Erstelle die URL für den Client
    const imageUrl = `/uploads/profile-images/${uniqueFileName}`;

    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler beim Upload' },
      { status: 500 }
    );
  }
}
