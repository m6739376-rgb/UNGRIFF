"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../../components/CartContext";

export default function Succes() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("chargement"); // chargement | attente | paye | erreur
  const { clearCart } = useCart();

  useEffect(() => {
    if (!sessionId) { setStatus("erreur"); return; }
    let tries = 0;
    const interval = setInterval(async () => {
      tries++;
      try {
        const res = await fetch(`/api/order?session_id=${sessionId}`);
        const data = await res.json();
        if (res.ok) {
          setOrder(data.order);
          if (data.order.payment_status === "paye") { setStatus("paye"); clearCart(); clearInterval(interval); }
          else setStatus("attente");
        }
      } catch (e) {}
      // Le paiement est confirmé par Stripe via webhook, qui peut prendre quelques secondes.
      if (tries > 15) clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (status === "erreur") return <section className="section"><p>Session de paiement introuvable.</p></section>;

  return (
    <section className="section" style={{ textAlign: "center" }}>
      {status !== "paye" && <><h2>Vérification du paiement...</h2><p>Merci de patienter quelques secondes, nous confirmons ton paiement auprès de la banque.</p></>}
      {status === "paye" && order && (
        <>
          <h2>Merci pour ta commande !</h2>
          <p>Numéro de commande : <strong>{order.order_number}</strong></p>
          <p>Total payé : <strong>{order.total.toFixed(2)} €</strong></p>
          <p>Un email de confirmation a été envoyé à {order.email}.</p>
        </>
      )}
    </section>
  );
}
