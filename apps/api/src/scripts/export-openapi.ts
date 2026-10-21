import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { buildApp } from '../app.js';

/**
 * Exporta el contrato OpenAPI a `docs/api/openapi.json` (versionado en el repo, p. ej. para
 * importarlo en Postman/Insomnia). No toca la red: las envs de Supabase son solo para que
 * `buildApp()` construya el cliente.
 *
 * Uso: pnpm --filter @app-deporte/api docs:export
 */
process.env.SUPABASE_URL ??= 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'docs-export-only';
process.env.ENABLE_DOCS = 'true';

const out = resolve(process.cwd(), '../../docs/api/openapi.json');

const run = async () => {
  const app = await buildApp();
  await app.ready();
  const spec = app.swagger();
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(spec, null, 2)}\n`, 'utf8');
  await app.close();
  console.log(`OpenAPI escrito en ${out}`);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
