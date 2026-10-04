"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../lib/supabaseBrowser";

export default function Compte() {
  const sb = supabaseBrowser();
  const [user, setUser] = useState(undefined); // undefined = chargement
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) sb.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => setOrders(data || []));
  }, [user]);

  function login() {
    sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/compte` } });
  }
  function logout() { sb.auth.signOut().then(() => setUser(null)); }

  if (user === undefined) return <section className="section"><p>Chargement...</p></section>;

  if (!user) {
    return (
      <section className="section" style={{ textAlign: "center" }}>
        <h2>Mon compte</h2>
        <p>Connecte-toi pour retrouver l'historique de tes commandes.</p>
        <button className="btn" onClick={login}>Se connecter avec Google</button>
        <p style={{ marginTop: 20, color: "#666", fontSize: 14 }}>Tu peux aussi commander sans créer de compte.</p>
      </section>
    );
  }

  return (
    <section className="section">
      <h2>Mon compte</h2>
      <p>{user.email}</p>
      <button className="btn outline" onClick={logout} style={{ marginBottom: 30 }}>Se déconnecter</button>

      <h3>Mes commandes</h3>
      {orders.length === 0 && <p>Aucune commande pour le moment.</p>}
      {orders.map(o => (
        <div className="msg" key={o.id}>
          <p><strong>{o.order_number}</strong> — <span className={`tag ${o.payment_status}`}>{o.payment_status === "paye" ? "Payée" : o.payment_status}</span></p>
          <p>Statut : {o.status} — Total : {o.total.toFixed(2)} €</p>
          <p style={{ fontSize: 13, color: "#666" }}>{new Date(o.created_at).toLocaleDateString("fr-FR")}</p>
        </div>
      ))}
    </section>
  );
}
