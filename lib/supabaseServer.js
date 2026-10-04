import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client "au nom de l'utilisateur connecté" : respecte les règles de sécurité (RLS).
export function supabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { try { cookieStore.set(name, value, options); } catch (e) {} },
        remove(name, options) { try { cookieStore.set(name, "", { ...options, maxAge: 0 }); } catch (e) {} }
      }
    }
  );
}

// Client "administrateur" : clé secrète, ignore les règles RLS. UNIQUEMENT utilisé côté serveur,
// jamais envoyé au navigateur, et uniquement après vérification que la personne est bien admin.
import { createClient } from "@supabase/supabase-js";
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
