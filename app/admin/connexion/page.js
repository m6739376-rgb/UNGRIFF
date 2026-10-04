"use client";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";

export default function AdminConnexion() {
  const sb = supabaseBrowser();
  function login() {
    sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/admin` } });
  }
  return (
    <section className="section" style={{ textAlign: "center" }}>
      <h2>Accès administrateur</h2>
      <p>Connecte-toi avec le compte Google autorisé pour accéder au panneau d'administration.</p>
      <button className="btn" onClick={login}>Se connecter avec Google</button>
    </section>
  );
}
