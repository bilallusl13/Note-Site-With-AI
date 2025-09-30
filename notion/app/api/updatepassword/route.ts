import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function PUT(req: Request) {
  const { email, password } = await req.json();

  if (!password) {
    return new Response("Lütfen geçerli bir şifre giriniz", { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return new Response("Kullanıcı bulunamadı", { status: 404 });
  }

  const newHashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email },
    data: { password: newHashedPassword },
  });

  return new Response("Şifre başarıyla güncellendi", { status: 200 });
}
