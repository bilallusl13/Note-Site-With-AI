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

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [
        { isRead: "asc" }, // Okunmamışlar önce
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Bilinmeyen hata" }, { status: 500 });
  }
} 