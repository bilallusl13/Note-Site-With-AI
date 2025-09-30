import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { id: eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Etkinlik ID'si gerekli" }, { status: 400 });
    }

    // Silinecek etkinliği bul
    const eventToDelete = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!eventToDelete) {
      return NextResponse.json({ error: "Etkinlik bulunamadı" }, { status: 404 });
    }

    // Yetki kontrolü: Sadece etkinliği oluşturan kullanıcı silebilir
    if (eventToDelete.userId !== userId) {
      return NextResponse.json({ error: "Bu işlemi yapmaya yetkiniz yok" }, { status: 403 });
    }

    // Etkinliği sil ve çöp kutusuna ekle (transaction)
    await prisma.$transaction([
      // 1. Etkinliği sil
      prisma.event.delete({
        where: { id: eventId },
      }),
      // 2. Çöp kutusuna kaydını ekle
      prisma.trash.create({
        data: {
          eventId: eventToDelete.id,
          eventTitle: eventToDelete.title,
        },
      }),
    ]);

    return NextResponse.json({ message: "Etkinlik başarıyla silindi" }, { status: 200 });

  } catch (error: any) {
    console.error("Etkinlik silinirken hata:", error);
    return NextResponse.json(
      { error: error.message || "Bilinmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
