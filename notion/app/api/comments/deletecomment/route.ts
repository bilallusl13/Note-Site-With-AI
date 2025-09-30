import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    // id yoksa hata dön
    if (!id) {
      return NextResponse.json({ error: "ID bilgisi eksik!", status: 400 }, { status: 400 });
    }

    const deletedNote = await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ response: deletedNote, status: 200 }, { status: 200 });
  } catch (error: any) {
    // Eğer hata NotFoundError ise, 404 dön
    if (
      error.code === "P2025" // Prisma Not Found error kodu
    ) {
      return NextResponse.json({ error: "Kayıt bulunamadı!", status: 404 }, { status: 404 });
    }

    return NextResponse.json({ error: error.message || "Bilinmeyen hata oluştu." }, { status: 500 });
  }
}
