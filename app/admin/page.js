"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { fetch("/api/admin/stats").then(r => r.json()).then(setStats); }, []);

  if (!stats) return <p>Chargement...</p>;

  return (
    <>
      <div className="stats">
        <div className="stat-card"><div className="n">{stats.totalOrders}</div><div className="l">Commandes totales</div></div>
        <div className="stat-card"><div className="n">{stats.pending}</div><div className="l">En attente de paiement</div></div>
        <div className="stat-card"><div className="n">{stats.paidCount}</div><div className="l">Commandes payées</div></div>
        <div className="stat-card"><div className="n">{stats.revenue.toFixed(2)} €</div><div className="l">Chiffre d'affaires réel</div></div>
        <div className="stat-card"><div className="n">{stats.productCount}</div><div className="l">Vêtements en ligne</div></div>
      </div>
      <h3>Produits les plus vendus</h3>
      {stats.topProducts.length === 0 && <p>Pas encore de vente.</p>}
      <table className="table">
        <tbody>
          {stats.topProducts.map(([name, qty]) => <tr key={name}><td>{name}</td><td>{qty} vendu(s)</td></tr>)}
        </tbody>
      </table>
    </>
  );
}
