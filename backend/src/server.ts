import { createApp } from './app.js';
import { config } from './config/env.js';
import { checkDatabaseConnection, closePool } from './db/client.js';

const port = config.port;

async function bootstrap() {
  let isDbConnected = false;
  try {
    isDbConnected = await checkDatabaseConnection();
  } catch (err: any) {
    console.log(`🗄️  PostgreSQL Database check failed: ${err?.message || err}`);
  }

  const app = createApp({ useInMemory: !isDbConnected });

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 Personal Portfolio Backend running on http://localhost:${port}`);
    console.log(`🌐 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Allowed CORS Origin: ${config.corsOrigin}`);
    console.log(`🗄️  PostgreSQL Database: ${isDbConnected ? 'CONNECTED (Healthy)' : 'NOT CONNECTED (Will fallback to in-memory mode)'}`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown handling
  function shutdown(signal: string) {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await closePool();
      console.log('HTTP server and database connections closed. Bye!');
      process.exit(0);
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return server;
}

bootstrap().catch((err: any) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

