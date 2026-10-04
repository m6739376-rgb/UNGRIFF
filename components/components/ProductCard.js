import Link from "next/link";

export default function ProductCard({ p }) {
  const hasPromo = p.promo_price != null && p.promo_price < p.price;
  return (
    <Link href={`/produit/${p.id}`} className="product-card">
      {hasPromo && <span className="badge">PROMO</span>}
      <div className="product-img" style={{ backgroundImage: `url(${p.images?.[0] || ""})` }} />
      <div className="product-info">
        <p className="product-cat">{p.category}</p>
        <h3>{p.name}</h3>
        <p className="product-price">
          {hasPromo
            ? <><strong>{p.promo_price.toFixed(2)} €</strong> <s>{p.price.toFixed(2)} €</s></>
            : <strong>{p.price.toFixed(2)} €</strong>}
        </p>
      </div>
    </Link>
  );
}
