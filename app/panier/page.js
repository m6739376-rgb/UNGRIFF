"use client";
import { useCart } from "../../components/CartContext";
import { useRouter } from "next/navigation";

export default function Panier() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return <section className="section"><h2>Panier</h2><p>Ton panier est vide.</p><button className="btn" onClick={() => router.push("/boutique")}>Voir la boutique</button></section>;
  }

  return (
    <section className="section">
      <h2>Panier</h2>
      {items.map(i => (
        <div className="cart-row" key={i.key}>
          <img src={i.image} alt={i.name} />
          <div className="grow">
            <strong>{i.name}</strong><br />
            <small>Taille {i.size} — {i.color}</small><br />
            <small>{i.price.toFixed(2)} € / unité</small>
          </div>
          <input type="number" min="1" value={i.qty} onChange={e => updateQty(i.key, parseInt(e.target.value) || 0)} style={{ width: 60, padding: 6 }} />
          <strong style={{ width: 80, textAlign: "right" }}>{(i.price * i.qty).toFixed(2)} €</strong>
          <button className="btn outline" onClick={() => removeItem(i.key)}>Supprimer</button>
        </div>
      ))}
      <p style={{ textAlign: "right", fontSize: 18, marginTop: 20 }}>Sous-total : <strong>{subtotal.toFixed(2)} €</strong></p>
      <div style={{ textAlign: "right" }}>
        <button className="btn" onClick={() => router.push("/commande")}>Commander</button>
      </div>
    </section>
  );
}
