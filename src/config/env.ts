import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1).optional(),
    MOEX_BASE_URL: z.string().default('https://iss.moex.com/iss'),
});

export const env = envSchema.parse(process.env);