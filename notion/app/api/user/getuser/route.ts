import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        // Auth header kontrolü
        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { error: "Authorization header bulunamadı" }, 
                { status: 401 }
            );
        }

        // Token format kontrolü
        if (!authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Geçersiz token formatı. 'Bearer <token>' formatı kullanın" }, 
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];
        
        // Token varlık kontrolü
        if (!token) {
            return NextResponse.json(
                { error: "Token bulunamadı" }, 
                { status: 401 }
            );
        }

        // JWT Secret kontrolü
        if (!process.env.JWT_SECRET) {
            return NextResponse.json(
                { error: "JWT_SECRET tanımlanmamış" }, 
                { status: 500 }
            );
        }

        // Token doğrulama
        const decoded: any = verify(token, process.env.JWT_SECRET);
        
        // UserId kontrolü
        if (!decoded.userId) {
            return NextResponse.json(
                { error: "Token'da userId bulunamadı" }, 
                { status: 401 }
            );
        }

        const userId = decoded.userId;

        // Kullanıcı sorgulama - DOĞRU SYNTAX
        const user = await prisma.user.findUnique({
            where: { id: userId }, // ✅ Doğru syntax
            include: {
    notes: true,     
    comments: true, 
  }
        });

        // Kullanıcı bulunamadı kontrolü
        if (!user) {
            return NextResponse.json(
                { error: "Kullanıcı bulunamadı" }, 
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            success: true,
            user: user 
        });

    } catch (error) {
        // JWT hata kontrolü
        if (error instanceof Error) {
            if (error.name === 'TokenExpiredError') {
                return NextResponse.json(
                    { error: "Token süresi dolmuş" }, 
                    { status: 401 }
                );
            }
            if (error.name === 'JsonWebTokenError') {
                return NextResponse.json(
                    { error: "Geçersiz token" }, 
                    { status: 401 }
                );
            }
        }

        console.error('Auth API Error:', error);
        return NextResponse.json(
            { error: "Sunucu hatası" }, 
            { status: 500 }
        );
    }
}