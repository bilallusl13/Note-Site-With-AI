import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Geçersiz ID bilgisi." },
        { status: 400 }
      );
    }

    const response = await prisma.note.findUnique({ 
      where: { id }
    });

    if (!response) {
      return NextResponse.json(
        { error: "Veri bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ response }, { status: 200 });

  } catch (error) {
    console.error("Sunucu hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
