import { supabaseServer, supabaseAdmin } from "./supabaseServer";

/**
 * Vérifie, côté serveur, que la personne qui fait la requête est :
 * 1. Réellement connectée (session Supabase valide, pas falsifiable depuis le navigateur)
 * 2. Avec un email vérifié
 * 3. Présente dans la table "admins" de la base de données
 *
 * Retourne { ok: true, email } ou { ok: false, status, message }.
 * Chaque route admin DOIT appeler cette fonction avant de lire/modifier quoi que ce soit.
 */
export async function requireAdmin() {
  const sb = supabaseServer();
  const { data: { user }, error } = await sb.auth.getUser();

  if (error || !user) return { ok: false, status: 401, message: "Non authentifié." };
  if (!user.email_confirmed_at) return { ok: false, status: 403, message: "Email non vérifié." };

  const admin = supabaseAdmin();
  const { data: row } = await admin.from("admins").select("email").eq("email", user.email).maybeSingle();
  if (!row) return { ok: false, status: 403, message: "Accès réservé aux administrateurs." };

  return { ok: true, email: user.email, userId: user.id };
}
