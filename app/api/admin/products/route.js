import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/requireAdmin";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const admin = supabaseAdmin();
  const { data, error } = await admin.from("products").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(req) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const body = await req.json();
  if (!body.name || body.price == null) return NextResponse.json({ error: "Nom et prix requis." }, { status: 400 });

  const admin = supabaseAdmin();
  const { data, error } = await admin.from("products").insert({
    name: body.name, description: body.description || "", price: body.price,
    promo_price: body.promo_price || null, category: body.category || "Autre",
    sizes: body.sizes || [], colors: body.colors || [], images: body.images || [],
    stock: body.stock || {}, featured: !!body.featured, visible: body.visible !== false
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}
