import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const trashItems = await prisma.trash.findMany({
      orderBy: {
        deletedAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: trashItems });
  } catch (error) {
    console.error("Error fetching trash items:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
} 