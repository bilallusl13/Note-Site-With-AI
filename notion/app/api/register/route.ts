import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(1),
});

export async function POST(req: Request) {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: 'Geçersiz veri', errors: result.error.issues }, { status: 400 });
    }

    const { email, password, username } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json({ error: 'Bu email zaten kayıtlı' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await prisma.user.create({
          data: {
              email,
              password: hashedPassword,
              name: username,
          },
      });
      return NextResponse.json({ user }, { status: 201 });
    } catch (err) {
      console.error('REGISTER ERROR:', err);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
