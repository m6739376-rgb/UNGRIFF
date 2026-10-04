import { supabaseAdmin } from "../lib/supabaseServer";
import ProductCard from "../components/ProductCard";

export const revalidate = 0;

export default async function Home() {
  const sb = supabaseAdmin();
  const { data: nouveautes } = await sb.from("products").select("*").eq("visible", true).order("created_at", { ascending: false }).limit(4);
  const { data: bestSellers } = await sb.from("products").select("*").eq("visible", true).eq("featured", true).limit(4);

  return (
    <>
      <section className="hero">
        <h1>UNGRIFF</h1>
        <p>Une marque de vêtements pensée pour durer. Pièces essentielles, coupes affirmées, qualité réelle.</p>
      </section>

      <section className="section">
        <h2>Nouveautés</h2>
        <div className="grid">
          {(nouveautes || []).map(p => <ProductCard key={p.id} p={p} />)}
          {(!nouveautes || nouveautes.length === 0) && <p>Aucun produit pour le moment.</p>}
        </div>
      </section>

      {bestSellers && bestSellers.length > 0 && (
        <section className="section">
          <h2>Meilleures ventes</h2>
          <div className="grid">{bestSellers.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </section>
      )}
    </>
  );
}
