"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { supabaseBrowser } from "../lib/supabaseBrowser";

export default function Navbar() {
  const { count } = useCart();
  const [user, setUser] = useState(null);
  const sb = supabaseBrowser();

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="nav">
      <Link href="/" className="logo">UNGRIFF</Link>
      <nav className="nav-links">
        <Link href="/">Accueil</Link>
        <Link href="/boutique">Boutique</Link>
        <Link href="/boutique?nouveautes=1">Nouveautés</Link>
        <Link href="/panier">Panier{count > 0 ? ` (${count})` : ""}</Link>
        <Link href="/compte">{user ? "Mon compte" : "Se connecter"}</Link>
      </nav>
    </header>
  );
}
