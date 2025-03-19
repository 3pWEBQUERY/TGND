import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validierungsschema für Kommentare
const commentSchema = z.object({
  content: z.string().min(1).max(1000),
});

// GET: Kommentare eines Posts abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const postId = params.postId;
    const url = new URL(request.url);
    
    // Paginierung
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Gesamtzahl der Kommentare
    const totalComments = await db.comment.count({
      where: { postId },
    });

    // Kommentare abrufen
    const comments = await db.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: {
              select: {
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
        likes: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });

    return NextResponse.json({
      comments,
      pagination: {
        total: totalComments,
        pages: Math.ceil(totalComments / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Kommentare:", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Kommentare" },
      { status: 500 }
    );
  }
}

// POST: Kommentar zu einem Post hinzufügen
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const postId = params.postId;
    const json = await request.json();
    const result = commentSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ungültige Daten", issues: result.error.issues },
        { status: 400 }
      );
    }

    // Prüfen, ob der Post existiert
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post nicht gefunden" },
        { status: 404 }
      );
    }

    // Kommentar erstellen
    const comment = await db.comment.create({
      data: {
        content: result.data.content,
        authorId: session.user.id,
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: {
              select: {
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Fehler beim Erstellen des Kommentars:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Kommentars" },
      { status: 500 }
    );
  }
} 