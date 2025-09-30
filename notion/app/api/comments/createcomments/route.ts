import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { NextResponse } from "next/server";

interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { text, noteId,isPublic } = body;

    // ✅ Token kontrolü
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Yetkisiz erişim. Token eksik." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Token doğrulama ve userId çekme
    let decoded: JwtPayload;
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (err) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 403 });
    }

    const userId = decoded.userId;

    // ✅ Boş alan kontrolü
    if (!text || !noteId) {
      return NextResponse.json(
        { error: "Eksik veri: 'text' ve 'noteId' zorunlu." },
        { status: 400 }
      );
    }

    // ✅ Yorum oluşturma
    const created = await prisma.comment.create({
      data: {
        text,
        userId,
        noteId,
        isPublic,
      },
    });

    // Bildirim ekle (notun sahibi farklıysa)
    const note = await prisma.note.findUnique({ where: { id: noteId }, select: { userId: true } });
    if (note && note.userId !== userId) {
      const sender = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      await prisma.notification.create({
        data: {
          userId: note.userId,
          senderId: userId,
          noteId,
          commentId: created.id,
          type: 'comment',
          message: `${sender?.name || 'Bir kullanıcı'} notuna yorum yaptı: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
        },
      });
    }

    return NextResponse.json({ response: created }, { status: 201 });
  } catch (error: any) {
    console.error("Sunucu Hatası:", error);
    return NextResponse.json({ error: error.message || "Bilinmeyen hata" }, { status: 500 });
  }
}
