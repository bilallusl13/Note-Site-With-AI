import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Test bildirimleri oluştur
    const users = await prisma.user.findMany({ select: { id: true, name: true } });
    
    if (users.length < 2) {
      return NextResponse.json({ error: "En az 2 kullanıcı gerekli" }, { status: 400 });
    }

    const testNotifications = await prisma.notification.createMany({
      data: [
        {
          userId: users[0].id,
          senderId: users[1].id,
          type: 'like',
          message: `${users[1].name} notunuzu beğendi`,
        },
        {
          userId: users[1].id,
          senderId: users[0].id,
          type: 'comment',
          message: `${users[0].name} notunuza yorum yaptı: "Harika bir paylaşım!"`,
        },
        {
          userId: users[0].id,
          senderId: users[1].id,
          type: 'like',
          message: `${users[1].name} yorumunuzu beğendi`,
        }
      ]
    });

    return NextResponse.json({
      message: `${testNotifications.count} test bildirimi oluşturuldu`,
      users: users.map(u => ({ id: u.id, name: u.name }))
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Test bildirimi oluşturma hatası" },
      { status: 500 }
    );
  }
}
