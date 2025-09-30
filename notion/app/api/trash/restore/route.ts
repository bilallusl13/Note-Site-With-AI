import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { trashId } = await req.json();

    if (!trashId || typeof trashId !== "string") {
      return NextResponse.json(
        { error: "Trash ID gerekli" },
        { status: 400 }
      );
    }

    // Find the trash item
    const trashItem = await prisma.trash.findUnique({
      where: { id: trashId },
    });

    if (!trashItem) {
      return NextResponse.json(
        { error: "Trash item bulunamadı" },
        { status: 404 }
      );
    }

    // Check if it's a note or event and restore accordingly
    if (trashItem.noteId && trashItem.noteHeader) {
      // This is a note - but we can't restore it without the original data
      // For now, just remove from trash
      return NextResponse.json(
        { error: "Not geri yükleme henüz desteklenmiyor - orijinal veri kayboldu" },
        { status: 400 }
      );
    } else if (trashItem.eventId && trashItem.eventTitle) {
      // This is an event - but we can't restore it without the original data
      return NextResponse.json(
        { error: "Event geri yükleme henüz desteklenmiyor - orijinal veri kayboldu" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Geçersiz trash item" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error restoring from trash:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
