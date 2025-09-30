import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { noteId } = await req.json();

    if (!noteId) {
      return new Response("noteId is required", { status: 400 });
    }

    // Önce kullanıcının zaten beğenip beğenmediğine bak
    const existingLike = await prisma.noteLike.findUnique({
      where: {
        userId_noteId: {
          userId,
          noteId,
        },
      },
    });

    if (existingLike) {
        const isdelete= await prisma.noteLike.delete({
           where: {
        userId_noteId: {
          userId,
          noteId,
        },
      },
        }
      
      
      )
      await prisma.note.update({
      where: { id: noteId },
      data: {
        likes: {
          decrement: 1,
        },
      },
    });
      return new Response("unliked succesffuly", { status: 409 });
    }

    // Yeni beğeni ekle
    await prisma.noteLike.create({
      data: { 
        userId,
        noteId,
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
          type: 'like',
          message: `${sender?.name || 'Bir kullanıcı'} notunu beğendi`,
        },
      });
    }

    // Notun like sayısını artır (optional)
    await prisma.note.update({
      where: { id: noteId },
      data: {
        likes: {
          increment: 1,
        },
      },
    });

    return new Response("Liked successfully", { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(`Error: ${error.message || error}`, { status: 500 });
  }
}
