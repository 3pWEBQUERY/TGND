import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Validierungsschema für neue Posts
const postSchema = z.object({
  content: z.string().min(1).max(5000),
  images: z.array(z.string().url()).optional().default([]),
  videos: z.array(z.string().url()).optional().default([]),
  type: z.string().optional().default("standard"),
  location: z.string().optional(),
});

// GET: Hole alle Posts (mit Paginierung)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const url = new URL(request.url);
    
    // Paginierung
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filter nach Autor und Typ (optional)
    const authorId = url.searchParams.get("authorId");
    const type = url.searchParams.get("type");
    
    // Erstelle das where-Objekt mit TypeScript-Typen
    const whereClause: any = {};
    
    if (authorId) {
      whereClause.authorId = authorId;
    }
    
    if (type && type !== "all") {
      whereClause.type = type;
    }

    // Posts abrufen mit Autor, Kommentaren und Likes
    const includeOptions: any = {
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
          _count: {
            select: { likes: true, replies: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 2, // Nur die neuesten Kommentare
      },
      _count: {
        select: { comments: true, likes: true },
      },
      likes: {
        where: { userId: session.user.id },
        select: { id: true },
      },
    };
    
    // Füge Umfragen hinzu, wenn sie existieren
    includeOptions.poll = {
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
    };
    
    const posts = await db.post.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: includeOptions,
    });

    // Gesamtzahl der Posts für Paginierung
    const totalPosts = await db.post.count({ where: whereClause });

    return NextResponse.json({
      posts,
      pagination: {
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Posts:", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Posts" },
      { status: 500 }
    );
  }
}

// POST: Erstelle einen neuen Post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const json = await request.json();
    const result = postSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Ungültige Daten", issues: result.error.issues },
        { status: 400 }
      );
    }

    // Erstelle das data-Objekt mit TypeScript-Typen
    const postData: any = {
      content: result.data.content,
      images: result.data.images,
      type: result.data.type,
      authorId: session.user.id,
    };
    
    // Füge optionale Felder hinzu
    if (result.data.location) {
      postData.location = result.data.location;
    }
    
    if (result.data.videos && result.data.videos.length > 0) {
      postData.videos = result.data.videos;
    }
    
    const newPost = await db.post.create({
      data: postData,
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

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Fehler beim Erstellen des Posts:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Posts" },
      { status: 500 }
    );
  }
}
