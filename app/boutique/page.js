import { supabaseAdmin } from "../../lib/supabaseServer";
import ShopFilters from "./ShopFilters";

export const revalidate = 0;

export default async function Boutique() {
  const sb = supabaseAdmin();
  const { data: products } = await sb.from("products").select("*").eq("visible", true).order("created_at", { ascending: false });

  return (
    <section className="section">
      <h2>Boutique</h2>
      <ShopFilters products={products || []} />
    </section>
  );
}
