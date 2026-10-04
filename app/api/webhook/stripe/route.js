import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

// IMPORTANT : cette route doit recevoir le corps BRUT de la requête pour vérifier la signature Stripe.
export const dynamic = "force-dynamic";

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Signature webhook invalide :", err.message);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      // On relit la commande pour retirer le stock, une seule fois (idempotence sur payment_status)
      const { data: order } = await admin.from("orders").select("*").eq("id", orderId).maybeSingle();
      if (order && order.payment_status !== "paye") {
        for (const it of order.items) {
          const { data: p } = await admin.from("products").select("stock").eq("id", it.productId).maybeSingle();
          if (p) {
            const key = `${it.size}-${it.color}`;
            const newStock = Math.max(0, (p.stock?.[key] ?? 0) - it.qty);
            await admin.from("products").update({ stock: { ...p.stock, [key]: newStock } }).eq("id", it.productId);
          }
        }
        await admin.from("orders").update({
          payment_status: "paye",
          status: "preparation",
          stripe_payment_intent: session.payment_intent
        }).eq("id", orderId);
      }
    }
  }

  if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) await admin.from("orders").update({ payment_status: "echoue" }).eq("id", orderId);
  }

  return NextResponse.json({ received: true });
}
