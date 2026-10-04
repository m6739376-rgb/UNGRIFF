import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/requireAdmin";
import { supabaseAdmin } from "../../../../../lib/supabaseServer";

export async function DELETE(req, { params }) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const admin = supabaseAdmin();
  const { count } = await admin.from("admins").select("*", { count: "exact", head: true });
  if ((count || 0) <= 1) return NextResponse.json({ error: "Impossible de supprimer le dernier administrateur." }, { status: 400 });

  const email = decodeURIComponent(params.email);
  const { error } = await admin.from("admins").delete().eq("email", email);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
