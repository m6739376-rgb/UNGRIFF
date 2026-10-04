import "./globals.css";
import { CartProvider } from "../components/CartContext";
import Navbar from "../components/Navbar";

export const metadata = { title: "UNGRIFF", description: "UNGRIFF — vêtements" };

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <CartProvider>
          <Navbar />
          {children}
          <footer className="footer">© {new Date().getFullYear()} UNGRIFF — Tous droits réservés.</footer>
        </CartProvider>
      </body>
    </html>
  );
}
