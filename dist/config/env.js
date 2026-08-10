"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(3000),
    MOEX_BASE_URL: zod_1.z.string().default('https://iss.moex.com/iss'),
    DB_NAME: zod_1.z.string().default('FundamentialAnalyze'),
    DB_HOST: zod_1.z.string().default('localhost'),
    DB_PORT: zod_1.z.number().default(5432),
    DB_USER: zod_1.z.string().default('postgres'),
    DB_PASSWORD: zod_1.z.string().default('1234'),
});
exports.env = envSchema.parse(process.env);
