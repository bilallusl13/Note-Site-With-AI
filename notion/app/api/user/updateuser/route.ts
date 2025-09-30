import { verify, JsonWebTokenError } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Kullanıcı güncelleme işlemi
export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası: Token eksik veya format hatalı" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId?: string };

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "Token geçersiz: userId bulunamadı" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const updateFields: Partial<{ name: string; email: string; photo: string }> = {};

    // İsim kontrolü
    if (typeof body.name === "string" && body.name.trim() !== "") {
      updateFields.name = body.name.trim();
    }

    // Email kontrolü
    if (typeof body.email === "string" && body.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email.trim())) {
        return NextResponse.json(
          { error: "Geçerli bir email adresi girin" },
          { status: 400 }
        );
      }
      updateFields.email = body.email.trim();
    }

    // Fotoğraf kontrolü
    if (typeof body.photo === "string") {
      updateFields.photo = body.photo;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "Güncellenecek geçerli bir alan girilmedi" },
        { status: 400 }
      );
    }

    // Güncelleme işlemi
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateFields,
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Kullanıcı başarıyla güncellendi",
      user: updatedUser,
    });

  } catch (error: any) {
    console.error("User update error:", error);

    // Prisma unique constraint hatası (örneğin aynı email)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 409 }
      );
    }

    // JWT hatası
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json(
        { error: "Geçersiz token" },
        { status: 401 }
      );
    }

    // Diğer hatalar
    return NextResponse.json(
      { error: "Sunucu hatası: " + (error.message || "Bilinmeyen hata") },
      { status: 500 }
    );
  }
}

// POST method'u da destekle (eski uyumluluk için)
export async function POST(req: Request) {
  return PUT(req);
}
