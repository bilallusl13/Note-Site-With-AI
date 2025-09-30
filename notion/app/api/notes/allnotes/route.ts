import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const notes = await prisma.note.findMany({ where: { userId } });

    if (notes.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(notes, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Bilinmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
