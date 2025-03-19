import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

// POST: Datei hochladen
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // Überprüfe, ob die Anfrage ein FormData-Objekt enthält
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Keine Datei gefunden" },
        { status: 400 }
      );
    }

    // Überprüfe den Dateityp
    const fileType = file.type;
    const isImage = fileType.startsWith("image/");
    const isVideo = fileType.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Nur Bilder und Videos sind erlaubt" },
        { status: 400 }
      );
    }

    // Überprüfe die Dateigröße (max. 50 MB)
    const maxSize = 50 * 1024 * 1024; // 50 MB in Bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Die Datei ist zu groß (max. 50 MB)" },
        { status: 400 }
      );
    }

    // Generiere einen eindeutigen Dateinamen
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const contentType = file.type;

    // Lade die Datei zu Vercel Blob hoch
    const blob = await put(fileName, file, {
      contentType,
      access: "public",
    });

    // Gib die URL der hochgeladenen Datei zurück
    return NextResponse.json({
      url: blob.url,
      type: isImage ? "image" : "video",
    });
  } catch (error) {
    console.error("Fehler beim Hochladen der Datei:", error);
    return NextResponse.json(
      { error: "Fehler beim Hochladen der Datei" },
      { status: 500 }
    );
  }
}

// Konfiguriere die maximale Anfragegröße
export const config = {
  api: {
    bodyParser: false,
  },
};
