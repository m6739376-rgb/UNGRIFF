import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseServer } from "../../../lib/supabaseServer";
import { stripe } from "../../../lib/stripe";

function generateOrderNumber() {
  const d = new Date();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `UNG-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${rand}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, shipping } = body;

    if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "Panier vide." }, { status: 400 });
    if (!shipping?.fullName || !shipping?.email || !shipping?.address1 || !shipping?.zip || !shipping?.city) {
      return NextResponse.json({ error: "Informations de livraison incomplètes." }, { status: 400 });
    }

    const admin = supabaseAdmin();

    // Récupère les vrais produits en base : on ne fait JAMAIS confiance au prix envoyé par le navigateur.
    const ids = [...new Set(items.map(i => i.productId))];
    const { data: products, error: pErr } = await admin.from("products").select("*").in("id", ids).eq("visible", true);
    if (pErr) throw pErr;

    const lineItems = [];
    const orderItems = [];
    let subtotal = 0;

    for (const it of items) {
      const p = products.find(pr => pr.id === it.productId);
      if (!p) return NextResponse.json({ error: "Un produit du panier n'existe plus." }, { status: 400 });

      const stockKey = `${it.size}-${it.color}`;
      const available = p.stock?.[stockKey] ?? 0;
      if (it.qty < 1 || it.qty > available) {
        return NextResponse.json({ error: `Stock insuffisant pour ${p.name} (${it.size}/${it.color}).` }, { status: 400 });
      }

      const unitPrice = p.promo_price != null && p.promo_price < p.price ? p.promo_price : p.price;
      subtotal += unitPrice * it.qty;
      orderItems.push({ productId: p.id, name: p.name, size: it.size, color: it.color, qty: it.qty, unitPrice });
      lineItems.push({
        price_data: { currency: "eur", product_data: { name: `${p.name} (${it.size}, ${it.color})` }, unit_amount: Math.round(unitPrice * 100) },
        quantity: it.qty
      });
    }

    const shippingFee = parseFloat(process.env.SHIPPING_FEE_EUR || "4.90");
    lineItems.push({ price_data: { currency: "eur", product_data: { name: "Frais de livraison" }, unit_amount: Math.round(shippingFee * 100) }, quantity: 1 });
    const total = subtotal + shippingFee;

    // Identifie le client s'il est connecté (commande invité autorisée sinon)
    const sb = supabaseServer();
    const { data: { user } } = await sb.auth.getUser();

    const orderNumber = generateOrderNumber();
    const { data: order, error: oErr } = await admin.from("orders").insert({
      order_number: orderNumber,
      user_id: user?.id || null,
      email: shipping.email,
      full_name: shipping.fullName,
      address1: shipping.address1,
      address2: shipping.address2 || "",
      country: shipping.country,
      zip: shipping.zip,
      city: shipping.city,
      phone: shipping.phone || "",
      items: orderItems,
      subtotal,
      shipping: shippingFee,
      total,
      status: "en_attente",
      payment_status: "non_paye"
    }).select().single();
    if (oErr) throw oErr;

    const site = process.env.NEXT_PUBLIC_SITE_URL;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: shipping.email,
      line_items: lineItems,
      success_url: `${site}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/panier`,
      metadata: { order_id: order.id, order_number: orderNumber }
    });

    await admin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur lors de la création de la commande." }, { status: 500 });
  }
}
