"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../../components/CartContext";

export default function ProductDetail({ p }) {
  const [size, setSize] = useState(p.sizes?.[0] || "");
  const [color, setColor] = useState(p.colors?.[0] || "");
  const [img, setImg] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const stockKey = `${size}-${color}`;
  const stock = p.stock?.[stockKey] ?? 0;
  const hasPromo = p.promo_price != null && p.promo_price < p.price;

  function handleAdd() {
    if (stock <= 0) return;
    addItem(p, size, color, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <section className="section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
      <div>
        <div className="product-img" style={{ aspectRatio: "3/4", backgroundImage: `url(${p.images?.[img] || ""})` }} />
        {p.images?.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {p.images.map((im, i) => (
              <div key={i} onClick={() => setImg(i)} className="product-img"
                   style={{ width: 70, aspectRatio: "3/4", backgroundImage: `url(${im})`, cursor: "pointer", outline: i === img ? "2px solid #111" : "none" }} />
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="product-cat">{p.category}</p>
        <h1 style={{ margin: "4px 0 10px" }}>{p.name}</h1>
        <p style={{ fontSize: 20, marginBottom: 20 }}>
          {hasPromo ? <><strong>{p.promo_price.toFixed(2)} €</strong> <s style={{ color: "#999", marginLeft: 8 }}>{p.price.toFixed(2)} €</s></> : <strong>{p.price.toFixed(2)} €</strong>}
        </p>
        <p style={{ color: "#444", lineHeight: 1.6, marginBottom: 20 }}>{p.description}</p>

        <label style={{ fontWeight: 700, fontSize: 13 }}>Taille</label>
        <div className="swatches">
          {(p.sizes || []).map(s => <span key={s} className={`swatch ${size === s ? "on" : ""}`} onClick={() => setSize(s)}>{s}</span>)}
        </div>

        <label style={{ fontWeight: 700, fontSize: 13 }}>Couleur</label>
        <div className="swatches">
          {(p.colors || []).map(c => <span key={c} className={`swatch ${color === c ? "on" : ""}`} onClick={() => setColor(c)}>{c}</span>)}
        </div>

        <p style={{ fontSize: 13, color: stock > 0 ? "#0a7a2f" : "#b00020", marginBottom: 16 }}>
          {stock > 0 ? `En stock (${stock} disponible${stock > 1 ? "s" : ""})` : "Rupture de stock pour cette taille/couleur"}
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" disabled={stock <= 0} onClick={handleAdd}>{added ? "Ajouté ✓" : "Ajouter au panier"}</button>
          <button className="btn outline" onClick={() => router.push("/panier")}>Voir le panier</button>
        </div>
      </div>
    </section>
  );
}
