import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const comments = await prisma.comment.findMany();

    if (comments.length === 0) {
      return NextResponse.json(
        { error: "Hiç yorum bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ response: comments }, { status: 200 });
  } catch (error) {
    console.error("Yorumları çekerken hata:", error);
    return NextResponse.json(
      { error: "Sunucuda bir hata oluştu." },
      { status: 500 }
    );
  }
}
