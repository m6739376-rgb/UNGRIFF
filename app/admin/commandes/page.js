"use client";
import { useEffect, useMemo, useState } from "react";

const LABELS = { en_attente: "En attente", preparation: "Préparation confirmée", expediee: "Expédiée", livree: "Livrée", annulee: "Annulée" };

export default function AdminCommandes() {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [openId, setOpenId] = useState(null);

  function load() { fetch("/api/admin/orders").then(r => r.json()).then(d => setOrders(d.orders || [])); }
  useEffect(load, []);

  async function setStatus(id, status) {
    await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }

  const filtered = useMemo(() => orders.filter(o => {
    if (filterStatus && o.status !== filterStatus) return false;
    if (q && !(`${o.order_number} ${o.full_name} ${o.email}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [orders, q, filterStatus]);

  return (
    <>
      <div className="cols2">
        <div className="field"><label>Rechercher</label><input value={q} onChange={e => setQ(e.target.value)} placeholder="N° commande, nom, email..." /></div>
        <div className="field"><label>Filtrer par statut</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tous</option>
            {Object.entries(LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
      </div>

      {filtered.map(o => (
        <div className="msg" key={o.id}>
          <p style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>COMMANDE DE : {o.full_name.toUpperCase()}</strong>
            <span className={`tag ${o.payment_status}`}>{o.payment_status === "paye" ? "Payée" : "Non payée"}</span>
          </p>
          <p style={{ fontSize: 13, color: "#666" }}>N° {o.order_number} — {new Date(o.created_at).toLocaleDateString("fr-FR")} — {o.total.toFixed(2)} €</p>
          <p style={{ fontSize: 13 }}>Statut : <strong>{LABELS[o.status]}</strong></p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0" }}>
            <button className="btn outline" onClick={() => setOpenId(openId === o.id ? null : o.id)}>Voir la commande</button>
            <button className="btn outline" onClick={() => setStatus(o.id, "preparation")}>Confirmer la préparation</button>
            <button className="btn outline" onClick={() => setStatus(o.id, "expediee")}>Marquer expédiée</button>
            <button className="btn outline" onClick={() => setStatus(o.id, "livree")}>Marquer livrée</button>
            <button className="btn danger" onClick={() => setStatus(o.id, "annulee")}>Annuler</button>
          </div>

          {openId === o.id && (
            <div style={{ borderTop: "1px solid #ccc", paddingTop: 10 }}>
              <p><strong>Client :</strong> {o.full_name} — {o.email} {o.phone && `— ${o.phone}`}</p>
              <p><strong>Adresse :</strong> {o.address1} {o.address2}, {o.zip} {o.city}, {o.country}</p>
              <p><strong>Articles :</strong></p>
              <ul>{o.items.map((it, i) => <li key={i}>{it.name} — {it.size}/{it.color} × {it.qty} — {(it.unitPrice*it.qty).toFixed(2)} €</li>)}</ul>
            </div>
          )}
        </div>
      ))}
      {filtered.length === 0 && <p>Aucune commande trouvée.</p>}
    </>
  );
}
