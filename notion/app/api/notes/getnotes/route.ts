import { prisma } from "@/lib/prisma";

import { NextResponse } from "next/server";


export async function GET(req:Request){
    try {
        const notes:any = await prisma.note.findMany({});
        if(notes==="P2025"){
            return NextResponse.json({error:"db ile bağlantı kurulamadı"},{status:200});
        }
        return NextResponse.json({response:notes},{status:200})
    } catch (error) {
        return NextResponse.json({error:`${error}`});
    }
}