import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/requireAdmin";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const admin = supabaseAdmin();
  const { data, error } = await admin.from("admins").select("*").order("added_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ admins: data });
}

export async function POST(req) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Email invalide." }, { status: 400 });

  const admin = supabaseAdmin();
  const { error } = await admin.from("admins").insert({ email: email.toLowerCase().trim() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
