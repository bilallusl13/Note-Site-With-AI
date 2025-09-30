import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT() {
  try {
    // Tüm yorumları public yap (test için)
    const updatedComments = await prisma.comment.updateMany({
      data: {
        isPublic: true
      }
    });

    return NextResponse.json({
      message: `${updatedComments.count} yorum public yapıldı`,
      count: updatedComments.count
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Bilinmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
