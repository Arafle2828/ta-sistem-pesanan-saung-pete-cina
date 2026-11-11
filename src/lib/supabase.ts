import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient<Database> | null = null;

/**
 * Klien Supabase untuk browser (anon key; akses dibatasi RLS).
 * Dibuat lazy agar aplikasi mockup tetap bisa berjalan sebelum .env.local diisi.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase belum dikonfigurasi. Salin .env.example ke .env.local lalu isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.",
    );
  }
  client ??= createClient<Database>(url, anonKey);
  return client;
}
