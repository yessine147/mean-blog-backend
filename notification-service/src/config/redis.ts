import Redis from 'ioredis';
import { env } from './env';

export function createRedisClient(): Redis {
  const client = new Redis(env.REDIS_URL);
  client.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('Redis error:', err);
  });
  return client;
}
