import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const header = req.headers.get("authorization");

    if (!header?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Geçersiz yetkilendirme başlığı" }, { status: 401 });
    }

    const token = header.split(" ")[1];

    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return NextResponse.json({ error: "Token geçersiz veya süresi dolmuş" }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mesaj içeriği eksik veya hatalı" }, { status: 400 });
    }

    const response = await prisma.userMessages.create({
      data: {
        message,
        userId: decoded.userId,
      },
    });

    return NextResponse.json({ success: true, data: response }, { status: 201 });

  } catch (error) {
    console.error("POST /api/aiserver/getmessage error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
