import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // FormData'yı al
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Sadece resim dosyaları kabul edilir" }, { status: 400 });
    }

    // Dosya boyutunu kontrol et (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Dosya boyutu 5MB'dan büyük olamaz" }, { status: 400 });
    }

    // Uploads klasörünü oluştur
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Benzersiz dosya ismi oluştur
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = path.extname(originalName);
    const fileName = `${timestamp}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    // Dosyayı kaydet
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    
    fs.writeFileSync(filePath, buffer);

    // Dosya URL'sini döndür
    const fileUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({ 
      url: fileUrl,
      message: "Dosya başarıyla yüklendi"
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "Dosya yükleme hatası: " + String(error) 
    }, { status: 500 });
  }
}