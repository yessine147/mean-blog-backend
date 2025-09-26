import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.preprocess((v) => Number(v ?? 3003), z.number().int().positive()),
  REDIS_URL: z.string().url(),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  SERVICE_API_KEY: z.string().min(1),
  CORS_ORIGIN: z.string().default('*'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
