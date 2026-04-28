import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '@/config';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase storage not configured');
  }
  client = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  return client;
}

export interface SignedUploadUrl {
  uploadUrl: string;
  token: string;
  path: string;
  expiresIn: number;
}

export async function createSignedUploadUrl(path: string, expiresIn = 60 * 5): Promise<SignedUploadUrl> {
  const c = getClient();
  const { data, error } = await c.storage.from(config.SUPABASE_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(`signed upload url failed: ${error?.message}`);
  return { uploadUrl: data.signedUrl, token: data.token, path: data.path, expiresIn };
}

export async function createSignedDownloadUrl(path: string, expiresIn = 60 * 60): Promise<string> {
  const c = getClient();
  const { data, error } = await c.storage
    .from(config.SUPABASE_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error || !data) throw new Error(`signed url failed: ${error?.message}`);
  return data.signedUrl;
}
