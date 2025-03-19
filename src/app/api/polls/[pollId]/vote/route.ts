import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validierungsschema für Abstimmungen
const voteSchema = z.object({
  optionId: z.string(),
});

// POST: Stimme für eine Option ab
export async function POST(
  request: NextRequest,
  { params }: { params: { pollId: string } }
) {
  try {
    // Extrahiere die pollId aus der URL statt aus params
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const pollId = pathSegments[pathSegments.length - 2]; // -2 weil der letzte Teil "vote" ist
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }
    const json = await request.json();
    const result = voteSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ungültige Daten", issues: result.error.issues },
        { status: 400 }
      );
    }

    // Überprüfen, ob die Umfrage existiert
    const poll = await db.poll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        options: true,
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Umfrage nicht gefunden" },
        { status: 404 }
      );
    }

    // Überprüfen, ob die Option zur Umfrage gehört
    const option = poll.options.find(
      (option) => option.id === result.data.optionId
    );

    if (!option) {
      return NextResponse.json(
        { error: "Option nicht gefunden" },
        { status: 404 }
      );
    }

    // Überprüfen, ob der Benutzer bereits abgestimmt hat
    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        option: {
          pollId,
        },
      },
    });

    if (existingVote) {
      // Wenn der Benutzer bereits für diese Option gestimmt hat, nichts tun
      if (existingVote.optionId === result.data.optionId) {
        return NextResponse.json(
          { message: "Du hast bereits für diese Option gestimmt" },
          { status: 200 }
        );
      }

      // Wenn der Benutzer für eine andere Option gestimmt hat, Stimme ändern
      const updatedVote = await db.vote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          optionId: result.data.optionId,
        },
      });

      return NextResponse.json(
        { message: "Stimme erfolgreich geändert", vote: updatedVote },
        { status: 200 }
      );
    }

    // Neue Stimme erstellen
    const vote = await db.vote.create({
      data: {
        userId: session.user.id,
        optionId: result.data.optionId,
      },
    });

    return NextResponse.json(
      { message: "Erfolgreich abgestimmt", vote },
      { status: 201 }
    );
  } catch (error) {
    console.error("Fehler beim Abstimmen:", error);
    return NextResponse.json(
      { error: "Fehler beim Abstimmen" },
      { status: 500 }
    );
  }
}

// DELETE: Entferne eine Stimme
export async function DELETE(
  request: NextRequest,
  { params }: { params: { pollId: string } }
) {
  try {
    // Extrahiere die pollId aus der URL statt aus params
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const pollId = pathSegments[pathSegments.length - 2]; // -2 weil der letzte Teil "vote" ist
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // Überprüfen, ob die Umfrage existiert
    const poll = await db.poll.findUnique({
      where: {
        id: pollId,
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Umfrage nicht gefunden" },
        { status: 404 }
      );
    }

    // Finde die Stimme des Benutzers
    const vote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        option: {
          pollId,
        },
      },
    });

    if (!vote) {
      return NextResponse.json(
        { error: "Keine Stimme gefunden" },
        { status: 404 }
      );
    }

    // Lösche die Stimme
    await db.vote.delete({
      where: {
        id: vote.id,
      },
    });

    return NextResponse.json(
      { message: "Stimme erfolgreich entfernt" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler beim Entfernen der Stimme:", error);
    return NextResponse.json(
      { error: "Fehler beim Entfernen der Stimme" },
      { status: 500 }
    );
  }
}
