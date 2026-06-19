import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase server-side con la SERVICE ROLE key.
 *
 * IMPORTANTE: la service_role key es exclusiva del backend. Bypassa RLS,
 * por lo que jamás debe devolverse al cliente ni loguearse. El frontend usa
 * la anon key; aquí usamos service_role solo para validar tokens y leer perfiles.
 */
let cachedClient: SupabaseClient | null = null;

/**
 * Lee las variables de entorno requeridas y falla con un mensaje claro si faltan.
 * Se invoca al construir la app para fallar temprano (fail-fast) en arranque.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const missing: string[] = [];
    if (!supabaseUrl) missing.push('SUPABASE_URL');
    if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    throw new Error(
      `Faltan variables de entorno requeridas para Supabase: ${missing.join(', ')}. ` +
        'Defínelas en el entorno del backend antes de arrancar la API.',
    );
  }

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}
