import {z} from "zod"

export const registerSchema = z.object({

  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(2), // Prisma modelindeki "name" alanına denk gelir
});
