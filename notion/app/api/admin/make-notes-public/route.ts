import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT() {
  try {
    // Tüm notları public yap (test için)
    const updatedNotes = await prisma.note.updateMany({
      where: {
        isDeleted: false // Sadece silinmemiş notları güncelle
      },
      data: {
        isPublic: true
      }
    });

    return NextResponse.json({
      message: `${updatedNotes.count} not public yapıldı`,
      count: updatedNotes.count
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Bilinmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
