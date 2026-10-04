"use client";
import { useEffect, useState } from "react";

export default function AdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function load() { fetch("/api/admin/admins").then(r => r.json()).then(d => setAdmins(d.admins || [])); }
  useEffect(load, []);

  async function add() {
    setError("");
    const res = await fetch("/api/admin/admins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setEmail(""); load();
  }
  async function remove(e) {
    if (!confirm(`Retirer ${e} des administrateurs ?`)) return;
    const res = await fetch(`/api/admin/admins/${encodeURIComponent(e)}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    load();
  }

  return (
    <>
      <h3>Administrateurs autorisés</h3>
      {error && <div className="msg error">{error}</div>}
      <div className="cols2" style={{ alignItems: "end" }}>
        <div className="field"><label>Ajouter un email administrateur</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="exemple@gmail.com" /></div>
        <button className="btn" onClick={add} style={{ height: 44 }}>Ajouter</button>
      </div>
      {admins.map(a => (
        <div className="msg" key={a.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{a.email}</span>
          <button className="btn danger" onClick={() => remove(a.email)}>Retirer</button>
        </div>
      ))}
    </>
  );
}
