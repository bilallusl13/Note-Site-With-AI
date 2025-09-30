import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID bilgisi bulunamadı" }, { status: 400 });
    }

    const response = await prisma.comment.findUnique({ where: { id } });

    if (!response) {
      return NextResponse.json({ error: "Veri bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
