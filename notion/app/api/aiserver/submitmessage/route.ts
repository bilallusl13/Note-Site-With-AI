import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mesaj alınamadı" }, { status: 400 });
    }

    

       const response = await ai.models.generateContent({
     
    model: "gemini-2.5-flash",
    
    contents: `bu konunun ozetini ver uzun olmasın ${message}`,
    config: {
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    }
  });



   
  console.log(response)
    // ✅ Burada response dönüyoruz!
    return NextResponse.json({response });

    


  

 
  } catch (err) {
    return NextResponse.json({ error: "Sunucu hatası", details: String(err) }, { status: 500 });
  }
}
