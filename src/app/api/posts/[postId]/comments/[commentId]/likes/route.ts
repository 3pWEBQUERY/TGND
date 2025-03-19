import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";

// POST: Einen Kommentar liken
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { commentId } = params;

    // Prüfen, ob der Kommentar existiert
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Kommentar nicht gefunden" },
        { status: 404 }
      );
    }

    // Prüfen, ob bereits ein Like existiert
    const existingLike = await db.like.findFirst({
      where: {
        userId: session.user.id,
        commentId,
        postId: null,
        replyId: null,
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "Kommentar wurde bereits geliked" },
        { status: 400 }
      );
    }

    // Like erstellen
    const like = await db.like.create({
      data: {
        userId: session.user.id,
        commentId,
      },
    });

    return NextResponse.json(like);
  } catch (error) {
    console.error("Fehler beim Liken des Kommentars:", error);
    return NextResponse.json(
      { error: "Fehler beim Liken des Kommentars" },
      { status: 500 }
    );
  }
}

// DELETE: Like eines Kommentars entfernen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { commentId } = params;

    // Prüfen, ob der Kommentar existiert
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Kommentar nicht gefunden" },
        { status: 404 }
      );
    }

    // Like finden und löschen
    const like = await db.like.findFirst({
      where: {
        userId: session.user.id,
        commentId,
        postId: null,
        replyId: null,
      },
    });

    if (!like) {
      return NextResponse.json(
        { error: "Like nicht gefunden" },
        { status: 404 }
      );
    }

    await db.like.delete({
      where: { id: like.id },
    });

    return NextResponse.json({ message: "Like erfolgreich entfernt" });
  } catch (error) {
    console.error("Fehler beim Entfernen des Likes:", error);
    return NextResponse.json(
      { error: "Fehler beim Entfernen des Likes" },
      { status: 500 }
    );
  }
} 