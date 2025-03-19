import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validierungsschema für die Aktualisierung von Posts
const updatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  images: z.array(z.string().url()).optional(),
  isPublished: z.boolean().optional(),
});

// GET: Hole einen spezifischen Post
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

    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profile: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                profile: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    profile: true,
                  },
                },
                _count: {
                  select: { likes: true },
                },
                likes: {
                  where: { userId: session.user.id },
                  select: { id: true },
                },
              },
              orderBy: { createdAt: "asc" },
            },
            _count: {
              select: { likes: true, replies: true },
            },
            likes: {
              where: { userId: session.user.id },
              select: { id: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { comments: true, likes: true },
        },
        likes: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Fehler beim Abrufen des Posts:", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen des Posts" },
      { status: 500 }
    );
  }
}

// PUT: Aktualisiere einen Post
export async function PUT(
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
    const result = updatePostSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ungültige Daten", issues: result.error.issues },
        { status: 400 }
      );
    }

    // Überprüfen, ob der Benutzer berechtigt ist, diesen Post zu aktualisieren
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 });
    }

    if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Keine Berechtigung zum Aktualisieren dieses Posts" },
        { status: 403 }
      );
    }

    const updatedPost = await db.post.update({
      where: { id: postId },
      data: result.data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profile: true,
          },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Posts:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Posts" },
      { status: 500 }
    );
  }
}

// DELETE: Lösche einen Post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const postId = params.postId;

    // Überprüfen, ob der Benutzer berechtigt ist, diesen Post zu löschen
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 });
    }

    if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Keine Berechtigung zum Löschen dieses Posts" },
        { status: 403 }
      );
    }

    await db.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fehler beim Löschen des Posts:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Posts" },
      { status: 500 }
    );
  }
} 