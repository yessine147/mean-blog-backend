import { connectToDatabase } from './config/db';
import { env } from './config/env';
import { createApp } from './app';

async function bootstrap() {
  await connectToDatabase(env.MONGO_URI);
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`article-service listening on port ${env.PORT}`);
    console.log(`Swagger docs: http://localhost:${env.PORT}/docs`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error during bootstrap', err);
  process.exit(1);
});
