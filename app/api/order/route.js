import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";

export async function GET(req) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "session_id manquant" }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: order } = await admin.from("orders")
    .select("order_number, payment_status, status, total, email")
    .eq("stripe_session_id", sessionId).maybeSingle();

  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  return NextResponse.json({ order });
}
