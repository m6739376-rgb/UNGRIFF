"use client";
import { useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard";

const CATS = ["Tous", "T-shirts", "Sweats", "Hoodies", "Pantalons", "Vestes", "Collections exclusives"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ShopFilters({ products }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tous");
  const [size, setSize] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (cat !== "Tous" && p.category !== cat) return false;
      if (size && !(p.sizes || []).includes(size)) return false;
      if (maxPrice && (p.promo_price ?? p.price) > parseFloat(maxPrice)) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [products, q, cat, size, maxPrice]);

  return (
    <>
      <div className="cols2" style={{ marginBottom: 24 }}>
        <div className="field"><label>Rechercher</label><input value={q} onChange={e => setQ(e.target.value)} placeholder="Nom du vêtement..." /></div>
        <div className="field"><label>Prix maximum (€)</label><input type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} /></div>
      </div>
      <div className="swatches">
        {CATS.map(c => <span key={c} className={`swatch ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</span>)}
      </div>
      <div className="swatches">
        <span className={`swatch ${size === "" ? "on" : ""}`} onClick={() => setSize("")}>Toutes tailles</span>
        {SIZES.map(s => <span key={s} className={`swatch ${size === s ? "on" : ""}`} onClick={() => setSize(s)}>{s}</span>)}
      </div>
      <div className="grid">
        {filtered.map(p => <ProductCard key={p.id} p={p} />)}
        {filtered.length === 0 && <p>Aucun vêtement ne correspond à ta recherche.</p>}
      </div>
    </>
  );
}
