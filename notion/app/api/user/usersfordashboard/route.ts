import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany({
        include:{
            notes:true,
            comments:{
              include:{
                note:{
                  select:{
                    id: true,
                    header: true,
                    text: true,
                    content: true,
                    classname: true
                  }
                }
              }
            }
        }
    });

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
