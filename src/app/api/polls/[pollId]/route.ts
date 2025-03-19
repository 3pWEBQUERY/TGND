import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";

// GET: Hole eine einzelne Umfrage mit Ergebnissen
export async function GET(
  request: NextRequest,
  { params }: { params: { pollId: string } }
) {
  try {
    // Extrahiere die pollId aus der URL statt aus params
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const pollId = pathSegments[pathSegments.length - 1];
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const poll = await db.poll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
            votes: {
              where: {
                userId: session.user.id,
              },
              select: {
                id: true,
              },
            },
          },
        },
        post: {
          select: {
            content: true,
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

    if (!poll) {
      return NextResponse.json(
        { error: "Umfrage nicht gefunden" },
        { status: 404 }
      );
    }

    // Berechne die Gesamtzahl der Stimmen
    const totalVotes = poll.options.reduce(
      (sum, option) => sum + option._count.votes,
      0
    );

    // Füge Prozentsätze hinzu
    const pollWithPercentages = {
      ...poll,
      options: poll.options.map((option) => ({
        ...option,
        percentage:
          totalVotes > 0
            ? Math.round((option._count.votes / totalVotes) * 100)
            : 0,
        hasVoted: option.votes.length > 0,
      })),
      totalVotes,
      hasVoted: poll.options.some((option) => option.votes.length > 0),
    };

    return NextResponse.json(pollWithPercentages);
  } catch (error) {
    console.error("Fehler beim Abrufen der Umfrage:", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Umfrage" },
      { status: 500 }
    );
  }
}
