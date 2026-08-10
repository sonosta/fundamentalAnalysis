import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    MOEX_BASE_URL: z.string().default('https://iss.moex.com/iss'),
    DB_NAME: z.string().default('FundamentialAnalyze'),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.number().default(5432),
    DB_USER: z.string().default('postgres'),
    DB_PASSWORD: z.string().default('1234'),
});

export const env = envSchema.parse(process.env);