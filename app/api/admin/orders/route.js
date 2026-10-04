import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/requireAdmin";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const admin = supabaseAdmin();
  const { data, error } = await admin.from("orders").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}
