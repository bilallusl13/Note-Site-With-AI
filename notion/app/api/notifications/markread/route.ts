import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Eksik id" }, { status: 400 });

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Bilinmeyen hata" }, { status: 500 });
  }
} 