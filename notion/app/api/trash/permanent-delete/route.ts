import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { trashId } = await req.json();

    if (!trashId || typeof trashId !== "string") {
      return NextResponse.json(
        { error: "Trash ID gerekli" },
        { status: 400 }
      );
    }

    // Delete the trash item permanently
    await prisma.trash.delete({
      where: { id: trashId },
    });

    return NextResponse.json(
      { success: true, message: "Öğe kalıcı olarak silindi" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error permanently deleting trash item:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
