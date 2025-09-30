import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    // Token kontrolü
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    // İstekten commentId alınır
    const { commentId } = await req.json();
    if (!commentId) {
      return new Response("commentId is required", { status: 400 });
    }

    // Kullanıcı zaten beğenmiş mi?
    const existing = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });
  
if (existing) {
  // Zaten beğenmiş: o zaman beğeniyi geri al (unlike)
await prisma.commentLike.delete({
  where: {
    userId_commentId: {
      userId,
      commentId,
    },
  },
});


  await prisma.comment.update({
    where: { id: commentId },
    data: { likes: { decrement: 1 } }
  });

  return NextResponse.json({response:"yorum beğenisi geri çekildi"},{status:200})
}

    // Yorumun beğenilmesi ve commentLike tablosuna ekleme
    const [updatedComment, _] = await prisma.$transaction([
      prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          likes: {
            increment: 1,
          },
        },
      }),
      prisma.commentLike.create({
        data: {
          userId,
          commentId,
        },
      }),
    ]);

    // Bildirim ekle (yorumun sahibi farklıysa)
    if (updatedComment.userId !== userId) {
      const sender = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      await prisma.notification.create({
        data: {
          userId: updatedComment.userId,
          senderId: userId,
          commentId,
          type: 'like',
          message: `${sender?.name || 'Bir kullanıcı'} yorumunu beğendi`,
        },
      });
    }

    // Başarılı yanıt
    return NextResponse.json({ message: "Beğenildi", comment: updatedComment });

  } catch (error) {
    console.error("PUT yorum beğeni hatası:", error);
    return new Response("Sunucu hatası", { status: 500 });
  }
}
