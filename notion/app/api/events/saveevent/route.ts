import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { NextResponse } from "next/server";

interface DecodedToken {
  userId: string;
  [key: string]: any;
}

interface EventData {
  title: string;
  description: string;
  color: string;
  Finaldate:string;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const header = req.headers.get("authorization");
    if (!header) {
      return NextResponse.json({ error: "Eksik veya geçersiz token" }, { status: 401 });
    }

    const token = header.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Eksik veya geçersiz token" }, { status: 401 });
    }

    let decoded: DecodedToken;
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as DecodedToken;
    } catch (error) {
      return NextResponse.json({ error: "Token doğrulanamadı" }, { status: 401 });
    }

    const userId = decoded.userId;

    const { title, description, color ,Finaldate}: EventData = await req.json();

   
  const date = new Date(Finaldate)
    const response = await prisma.event.create({
      data: {
        userId,
        title,
        description,
        color,
        date
      },
    });

    return NextResponse.json({ response }, { status: 201 });
  } catch (error) {
    console.error("API POST error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
