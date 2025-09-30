import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { NextResponse } from "next/server";

// Belirli bir notu getir
export async function GET(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const note = await prisma.note.findUnique({
      where: {
        id: params.noteId,
        userId: userId, // Sadece kendi notunu getirebilir
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Not bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

// Notu güncelle
export async function PUT(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { content } = await req.json();

    const existingNote = await prisma.note.findUnique({
        where: { id: params.noteId }
    });

    if (!existingNote || existingNote.userId !== userId) {
        return NextResponse.json({ error: "Yetkiniz yok veya not bulunamadı" }, { status: 403 });
    }

    const updatedNote = await prisma.note.update({
      where: {
        id: params.noteId,
      },
      data: {
        content: content, // 'body' değil 'content' kullanıyoruz
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    return NextResponse.json(
      { error: "Güncelleme başarısız" },
      { status: 500 }
    );
  }
}

