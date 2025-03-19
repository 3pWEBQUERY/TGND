import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validierungsschema für neue Umfragen
const pollSchema = z.object({
  postId: z.string(),
  question: z.string().min(1).max(500),
  options: z.array(z.string().min(1).max(200)).min(2).max(10),
});

// POST: Erstelle eine neue Umfrage
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const json = await request.json();
    const result = pollSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ungültige Daten", issues: result.error.issues },
        { status: 400 }
      );
    }

    // Überprüfen, ob der Post existiert und dem aktuellen Benutzer gehört
    const post = await db.post.findUnique({
      where: {
        id: result.data.postId,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post nicht gefunden" },
        { status: 404 }
      );
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert, dieser Post gehört nicht dir" },
        { status: 403 }
      );
    }

    // Überprüfen, ob bereits eine Umfrage für diesen Post existiert
    const existingPoll = await db.poll.findUnique({
      where: {
        postId: result.data.postId,
      },
    });

    if (existingPoll) {
      return NextResponse.json(
        { error: "Für diesen Post existiert bereits eine Umfrage" },
        { status: 400 }
      );
    }

    // Umfrage erstellen
    const poll = await db.poll.create({
      data: {
        postId: result.data.postId,
        question: result.data.question,
        options: {
          create: result.data.options.map((option) => ({
            text: option,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    console.error("Fehler beim Erstellen der Umfrage:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Umfrage" },
      { status: 500 }
    );
  }
}

// GET: Hole alle Umfragen
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const polls = await db.poll.findMany({
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
        post: {
          select: {
            authorId: true,
            author: {
              select: {
                name: true,
                image: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(polls);
  } catch (error) {
    console.error("Fehler beim Abrufen der Umfragen:", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Umfragen" },
      { status: 500 }
    );
  }
}
