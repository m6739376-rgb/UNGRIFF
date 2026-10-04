import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/requireAdmin";
import { supabaseAdmin } from "../../../../../lib/supabaseServer";

const ALLOWED_STATUS = ["en_attente", "preparation", "expediee", "livree", "annulee"];

export async function PATCH(req, { params }) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const body = await req.json();
  if (!ALLOWED_STATUS.includes(body.status)) return NextResponse.json({ error: "Statut invalide." }, { status: 400 });

  const admin = supabaseAdmin();
  const { error } = await admin.from("orders").update({ status: body.status }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
