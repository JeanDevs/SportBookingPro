import { buildApp } from './app.js';

const start = async () => {
  const app = await buildApp();
  const port = Number(process.env.PORT ?? 3002);
  await app.listen({ port, host: '127.0.0.1' });
};

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
