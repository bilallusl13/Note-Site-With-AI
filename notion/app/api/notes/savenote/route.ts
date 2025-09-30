import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connect } from 'http2';


export async function POST(req: Request) {
  try {
    const { header, userId, text, isPublic, classname } = await req.json();
    
   

    // header alanına göre mevcut notu kontrol et
    const existing = await prisma.note.findFirst({ where: { header } });

    if (existing) {
      // Mevcutsa notu güncelle
      await prisma.note.update({
        where: { id: existing.id },
        data: { text, isPublic, classname },
      });
    } else {
      // Yoksa yeni not oluştur
      await prisma.note.create({
        data: {
          header,
          text, // 'text' yerine 'content' kullanılıyor
          isPublic,
          classname,
          user: {
            connect: { id: userId },
          },
        },
      });
    }

    return NextResponse.json({ message: "Başarılı" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { header } = await req.json();
    console.log("🔍 Gelen header:", header); // Debug log
    
    if (!header) {
      console.log("❌ Header boş");
      return NextResponse.json({ error: "Header gerekli." }, { status: 400 });
    }

    // Header ile notu bul
    const note = await prisma.note.findFirst({ where: { header } });
    console.log("📝 Bulunan not:", note); // Debug log
    
    if (!note) {
      console.log("❌ Not bulunamadı, header:", header);
      return NextResponse.json({ error: "Not bulunamadı." }, { status: 404 });
    }

    // ID ile sil
    console.log("🗑️ Silme işlemi başlıyor, ID:", note.id);
    await prisma.note.delete({ where: { id: note.id } });
    console.log("✅ Silme başarılı, ID:", note.id); // Debug log

    return NextResponse.json({ message: "Silme işlemi başarılı." }, { status: 200 });
  } catch (error) {
    console.error("💥 Delete error:", error);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
