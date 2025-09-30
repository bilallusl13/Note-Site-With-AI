import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    // id kontrolü: undefined, null, boş string veya string değilse hata
    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Hata: 'id' bilgisi gönderilmedi veya geçersiz." },
        { status: 400 }
      );
    }

    // First, find the note to get its header and eventId
    const note = await prisma.note.findUnique({
      where: { id },
      select: { header: true, eventId: true },
    });

    if (!note) {
      return new NextResponse("Note not found", { status: 404 });
    }

    // Create a new entry in the Trash table with the note's header
    const newTrashItem = await prisma.trash.create({
      data: {
        noteId: id,
        noteHeader: note.header, // Copy the header here
        eventId: note.eventId,
        // If the note is associated with an event, we could also fetch and store the event title
      },
    });

    // Now delete the note
    await prisma.note.delete({
      where: { id },
    });

    return new NextResponse("Note deleted and moved to trash", { status: 200 });
  } catch (error) {
    console.error("Error deleting note:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
