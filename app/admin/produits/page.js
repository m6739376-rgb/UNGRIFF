"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";

const CATS = ["T-shirts", "Sweats", "Hoodies", "Pantalons", "Vestes", "Collections exclusives"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = ["Noir", "Blanc", "Gris", "Beige", "Bleu", "Rouge", "Vert"];
const EMPTY = { id: null, name: "", description: "", price: "", promo_price: "", category: "T-shirts", sizes: [], colors: [], images: [], stock: {}, featured: false, visible: true };

export default function AdminProduits() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(null); // null = liste, objet = formulaire ouvert
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const sb = supabaseBrowser();

  function load() { fetch("/api/admin/products").then(r => r.json()).then(d => setProducts(d.products || [])); }
  useEffect(load, []);

  function openNew() { setForm({ ...EMPTY }); setError(""); }
  function openEdit(p) { setForm({ ...p, price: p.price, promo_price: p.promo_price || "" }); setError(""); }

  function toggleIn(arr, val) { return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]; }

  async function handleUpload(e) {
    const file = e.target.files[0]; e.target.value = "";
    if (!file || form.images.length >= 4) return;
    setUploading(true);
    const path = `${Date.now()}_${file.name}`;
    const { error: upErr } = await sb.storage.from("products").upload(path, file);
    if (upErr) { setError("Erreur d'envoi de l'image : " + upErr.message); setUploading(false); return; }
    const { data } = sb.storage.from("products").getPublicUrl(path);
    setForm(f => ({ ...f, images: [...f.images, data.publicUrl] }));
    setUploading(false);
  }

  async function save() {
    setError("");
    if (!form.name.trim() || form.price === "" || form.sizes.length === 0 || form.colors.length === 0 || form.images.length === 0) {
      setError("Nom, prix, au moins une taille, une couleur et une image sont requis.");
      return;
    }
    const payload = {
      ...form, price: parseFloat(form.price), promo_price: form.promo_price === "" ? null : parseFloat(form.promo_price)
    };
    const url = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
    const method = form.id ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setForm(null); load();
  }

  async function del(id) {
    if (!confirm("Supprimer ce vêtement ?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleVisible(p) {
    await fetch(`/api/admin/products/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...p, visible: !p.visible }) });
    load();
  }

  if (form) {
    return (
      <div>
        <h3>{form.id ? "Modifier le vêtement" : "Nouveau vêtement"}</h3>
        {error && <div className="msg error">{error}</div>}
        <div className="field"><label>Nom</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
        <div className="field"><label>Description</label><textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        <div className="cols2">
          <div className="field"><label>Prix (€)</label><input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
          <div className="field"><label>Prix promotionnel (facultatif, €)</label><input type="number" step="0.01" value={form.promo_price} onChange={e => setForm(f => ({ ...f, promo_price: e.target.value }))} /></div>
        </div>
        <div className="field"><label>Catégorie</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <label style={{ fontWeight: 700, fontSize: 13 }}>Photos (4 maximum)</label>
        <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
          {form.images.map((im, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={im} style={{ width: 70, height: 90, objectFit: "cover" }} />
              <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                style={{ position: "absolute", top: -6, right: -6, background: "#111", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20 }}>×</button>
            </div>
          ))}
        </div>
        {form.images.length < 4 && <label className="btn outline" style={{ display: "inline-block", marginBottom: 16 }}>
          {uploading ? "Envoi..." : "+ Ajouter une photo"}
          <input type="file" accept="image/*" hidden onChange={handleUpload} disabled={uploading} />
        </label>}

        <label style={{ fontWeight: 700, fontSize: 13 }}>Tailles disponibles</label>
        <div className="swatches">{SIZES.map(s => <span key={s} className={`swatch ${form.sizes.includes(s) ? "on" : ""}`} onClick={() => setForm(f => ({ ...f, sizes: toggleIn(f.sizes, s) }))}>{s}</span>)}</div>

        <label style={{ fontWeight: 700, fontSize: 13 }}>Couleurs disponibles</label>
        <div className="swatches">{COLORS.map(c => <span key={c} className={`swatch ${form.colors.includes(c) ? "on" : ""}`} onClick={() => setForm(f => ({ ...f, colors: toggleIn(f.colors, c) }))}>{c}</span>)}</div>

        {form.sizes.length > 0 && form.colors.length > 0 && (
          <>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Stock par taille / couleur</label>
            <table className="table" style={{ marginBottom: 16 }}>
              <thead><tr><th></th>{form.colors.map(c => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {form.sizes.map(s => (
                  <tr key={s}>
                    <td><strong>{s}</strong></td>
                    {form.colors.map(c => {
                      const key = `${s}-${c}`;
                      return <td key={c}><input type="number" min="0" style={{ width: 60 }} value={form.stock[key] ?? 0}
                        onChange={e => setForm(f => ({ ...f, stock: { ...f.stock, [key]: parseInt(e.target.value) || 0 } }))} /></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
          <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} /> Mettre en avant sur la page d'accueil (meilleures ventes)
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
          <input type="checkbox" checked={form.visible} onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))} /> Visible sur le site
        </label>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn outline" onClick={() => setForm(null)}>Annuler</button>
          <button className="btn" onClick={save}>{form.id ? "Enregistrer" : "Publier"}</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button className="btn" onClick={openNew} style={{ marginBottom: 20 }}>+ Ajouter un vêtement</button>
      {products.map(p => (
        <div className="msg" key={p.id} style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <img src={p.images?.[0]} style={{ width: 50, height: 65, objectFit: "cover" }} />
          <div style={{ flex: 1 }}>
            <strong>{p.name}</strong> — {p.category} — {p.price.toFixed(2)} € {p.promo_price && <span className="tag">Promo {p.promo_price.toFixed(2)} €</span>}
            {!p.visible && <span className="tag" style={{ marginLeft: 6 }}>Masqué</span>}
            {p.featured && <span className="tag" style={{ marginLeft: 6 }}>En avant</span>}
          </div>
          <button className="btn outline" onClick={() => openEdit(p)}>Modifier</button>
          <button className="btn outline" onClick={() => toggleVisible(p)}>{p.visible ? "Masquer" : "Rendre visible"}</button>
          <button className="btn danger" onClick={() => del(p.id)}>Supprimer</button>
        </div>
      ))}
      {products.length === 0 && <p>Aucun vêtement. Clique sur « + Ajouter un vêtement ».</p>}
    </>
  );
}
