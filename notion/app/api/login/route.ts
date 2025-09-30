import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signJwt } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Geçersiz veri kontrolü
    if (!email || !password) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
  }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Şifreyi karşılaştır
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Şifre yanlış' }, { status: 401 });
    }

    // JWT oluştur
    const token = await signJwt({ userId: user.id, email: user.email, name: user.name, role: user.role });

    // TOKEN'I COOKIE'YE YAZ!
    const response = NextResponse.json({ success: true, token, name: user.name, id: user.id, role: user.role });
    response.cookies.set("authToken", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;

  } catch (error) {
    console.error("Giriş Hatası:", error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}  
