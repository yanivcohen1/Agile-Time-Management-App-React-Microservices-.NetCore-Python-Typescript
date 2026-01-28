import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

async function bootstrap(): Promise<void> {
  const port = env.port;

  await connectDatabase();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

bootstrap().catch(console.error);
