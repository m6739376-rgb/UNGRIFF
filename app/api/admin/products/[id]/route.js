import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/requireAdmin";
import { supabaseAdmin } from "../../../../../lib/supabaseServer";

export async function PUT(req, { params }) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const body = await req.json();
  const admin = supabaseAdmin();
  const { error } = await admin.from("products").update({
    name: body.name, description: body.description || "", price: body.price,
    promo_price: body.promo_price || null, category: body.category || "Autre",
    sizes: body.sizes || [], colors: body.colors || [], images: body.images || [],
    stock: body.stock || {}, featured: !!body.featured, visible: body.visible !== false
  }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const admin = supabaseAdmin();
  const { error } = await admin.from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
