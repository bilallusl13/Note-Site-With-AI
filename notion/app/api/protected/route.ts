// notion/app/api/protected/route.ts
import { verifyJwt } from "@/lib/jwt";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1];
  const payload = token ? verifyJwt(token) : null;
  if (!payload) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ... protected logic
}