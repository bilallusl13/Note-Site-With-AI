import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const { id, isPublic, text, header} = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Eksik veya hatalı bilgi girişi" },
        { status: 400 }
      );
    }

    // Kaydı id ile bul
    const existingNote = await prisma.note.findUnique({ where: { id } });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Veri bulunamadı" },
        { status: 404 }
      );
    }

    // Güncelle
    const updatedNote = await prisma.note.update({
      where: { id },
      data: { isPublic, text, header },
    });

    return NextResponse.json(updatedNote, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu" },
      { status: 500 }
    );
  }
}
