"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../components/CartContext";

const SHIPPING_FEE = 4.90; // doit correspondre à SHIPPING_FEE_EUR côté serveur (affichage seulement : le vrai calcul est refait côté serveur)

export default function Commande() {
  const { items, subtotal } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", address1: "", address2: "", country: "FR", zip: "", city: "", phone: "" });
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const total = subtotal + SHIPPING_FEE;

  async function handlePay() {
    setError("");
    if (!form.fullName || !form.email || !form.address1 || !form.zip || !form.city) {
      setError("Nom complet, email, adresse, code postal et ville sont requis.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, size: i.size, color: i.color, qty: i.qty })),
          shipping: form
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création de la commande.");
      window.location.href = data.url; // redirige vers Stripe Checkout (paiement réel et sécurisé)
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  if (items.length === 0) return <section className="section"><p>Ton panier est vide.</p></section>;

  return (
    <section className="section" style={{ maxWidth: 640 }}>
      <h2>Commande</h2>
      <div className="field"><label>Nom complet</label><input value={form.fullName} onChange={set("fullName")} /></div>
      <div className="field"><label>Adresse e-mail</label><input type="email" value={form.email} onChange={set("email")} /></div>
      <div className="field"><label>Adresse ligne 1</label><input value={form.address1} onChange={set("address1")} /></div>
      <div className="field"><label>Adresse complémentaire (facultatif)</label><input value={form.address2} onChange={set("address2")} /></div>
      <div className="cols2">
        <div className="field"><label>Pays</label>
          <select value={form.country} onChange={set("country")}>
            <option value="FR">France</option><option value="BE">Belgique</option><option value="CH">Suisse</option>
            <option value="DE">Allemagne</option><option value="ES">Espagne</option><option value="IT">Italie</option>
            <option value="GB">Royaume-Uni</option><option value="CA">Canada</option><option value="US">États-Unis</option>
          </select>
        </div>
        <div className="field"><label>Code postal</label><input value={form.zip} onChange={set("zip")} /></div>
      </div>
      <div className="field"><label>Ville</label><input value={form.city} onChange={set("city")} /></div>
      <div className="field"><label>Numéro de téléphone (facultatif)</label><input value={form.phone} onChange={set("phone")} /></div>

      <button className="btn outline" style={{ marginBottom: 16 }} onClick={() => setShowSummary(s => !s)}>
        {showSummary ? "Masquer la commande" : "Voir la commande"}
      </button>

      {showSummary && (
        <div className="msg">
          {items.map(i => (
            <p key={i.key} style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
              <span>{i.name} — {i.size}/{i.color} × {i.qty}</span><span>{(i.price * i.qty).toFixed(2)} €</span>
            </p>
          ))}
          <hr />
          <p style={{ display: "flex", justifyContent: "space-between" }}><span>Sous-total</span><span>{subtotal.toFixed(2)} €</span></p>
          <p style={{ display: "flex", justifyContent: "space-between" }}><span>Livraison</span><span>{SHIPPING_FEE.toFixed(2)} €</span></p>
          <p style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}><span>Total</span><span>{total.toFixed(2)} €</span></p>
          <small>Le numéro de commande sera généré automatiquement après validation.</small>
        </div>
      )}

      {error && <div className="msg error">{error}</div>}

      <button className="btn" disabled={loading} onClick={handlePay} style={{ width: "100%" }}>
        {loading ? "Redirection vers le paiement sécurisé..." : `Payer ${total.toFixed(2)} €`}
      </button>
      <small style={{ display: "block", marginTop: 10, color: "#666" }}>
        Paiement 100% sécurisé via Stripe. Aucune donnée bancaire n'est jamais transmise à UNGRIFF.
      </small>
    </section>
  );
}
