import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { NextResponse } from "next/server";

interface JwtPayload {
  userId: string;
}

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Yetkisiz erişim. Token eksik." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: JwtPayload;

    try {
      decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 403 });
    }

    const userId = decoded.userId;

    const body = await req.json();
    const { commentId, text, isPublic } = body;

    if (!commentId || !text) {
      return NextResponse.json({ error: "Eksik veri: 'commentId' ve 'text' zorunlu." }, { status: 400 });
    }

    // ✅ Güncellenecek yorumu bul (kullanıcıya ait, id ile)
    const existingComment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        userId,
      },
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Yorum bulunamadı veya yetkiniz yok." }, { status: 404 });
    }

    // ✅ Yorumu güncelle
    const updatedComment = await prisma.comment.update({
      where: {
        id: existingComment.id,
      },
      data: {
        text,
        ...(typeof isPublic === "boolean" ? { isPublic } : {}), // opsiyonel publiclik
      },
    });

    return NextResponse.json({ response: updatedComment }, { status: 200 });

  } catch (error: any) {
    console.error("Sunucu hatası:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
