import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/requireAdmin";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const admin = supabaseAdmin();
  const { data: orders } = await admin.from("orders").select("status, payment_status, total, items");
  const { count: productCount } = await admin.from("products").select("*", { count: "exact", head: true }).eq("visible", true);

  const totalOrders = orders?.length || 0;
  const pending = orders?.filter(o => o.payment_status === "non_paye").length || 0;
  const paid = orders?.filter(o => o.payment_status === "paye") || [];
  const revenue = paid.reduce((s, o) => s + Number(o.total), 0);

  const salesByProduct = {};
  for (const o of paid) for (const it of (o.items || [])) salesByProduct[it.name] = (salesByProduct[it.name] || 0) + it.qty;
  const topProducts = Object.entries(salesByProduct).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return NextResponse.json({ totalOrders, pending, paidCount: paid.length, revenue, productCount: productCount || 0, topProducts });
}
