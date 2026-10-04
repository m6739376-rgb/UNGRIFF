import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../lib/requireAdmin";

export default async function AdminLayout({ children }) {
  const check = await requireAdmin();
  if (!check.ok) redirect("/admin/connexion");

  return (
    <section className="section">
      <h2>Panneau administrateur</h2>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 18 }}>Connecté en tant que {check.email}</p>
      <div className="admin-tabs">
        <Link href="/admin">Tableau de bord</Link>
        <Link href="/admin/commandes">Commandes</Link>
        <Link href="/admin/produits">Vêtements</Link>
        <Link href="/admin/admins">Administrateurs</Link>
      </div>
      {children}
    </section>
  );
}
