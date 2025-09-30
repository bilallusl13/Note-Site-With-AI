import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT() {
  try {
    // Test için bazı notları yüksek beğeni ile güncelle
    await prisma.note.update({
      where: { id: "c3f67573-8e70-41ce-9d32-e288fc27405b" }, // Taylor'ın notu
      data: { likes: 2500 }
    });

    await prisma.note.update({
      where: { id: "b8d2a5fd-29ce-46a3-b2a0-0377b5499b12" }, // Ariana'nın ilk notu
      data: { likes: 15600 }
    });

    await prisma.note.update({
      where: { id: "91fb6fb3-d59d-4712-92e0-c808d6ccffe2" }, // Ariana'nın ikinci notu
      data: { likes: 1200000 }
    });

    return NextResponse.json({
      message: "Test beğeni sayıları güncellendi",
      updates: [
        { id: "taylor", likes: "2.5K" },
        { id: "ariana1", likes: "15.6K" },
        { id: "ariana2", likes: "1.2M" }
      ]
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Güncelleme hatası" },
      { status: 500 }
    );
  }
}
