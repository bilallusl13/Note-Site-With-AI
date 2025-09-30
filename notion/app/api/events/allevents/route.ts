
import { NextResponse } from "next/server";
import {verify} from "jsonwebtoken"
import { prisma } from "@/lib/prisma";
import { error } from "console";

interface DecodedToken {
  userId: string;
  [key: string]: any;
}


export async function GET(req: Request){
  try {
    const header = req.headers.get("authorization");
    if (!header) {
      return NextResponse.json({ error: "Eksik veya geçersiz token" }, { status: 401 });
    }

    const token = header.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Eksik veya geçersiz token" }, { status: 401 });
    }

    let decoded: DecodedToken;
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as DecodedToken;
    } catch (error) {
      return NextResponse.json({ error: "Token doğrulanamadı" }, { status: 401 });
    }

    const userId = decoded.userId;

   const response =await prisma.event.findMany({
    where:{userId}
   })

   if(!response){
    return NextResponse.json({error:"veri bulunamadı"},{status:404});
   }
   return NextResponse.json({response},{status:201});
 

   
  } catch (error) {
    console.error("API POST error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
