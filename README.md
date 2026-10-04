# UNGRIFF — site e-commerce

Stack 100% gratuite, sans carte bancaire obligatoire pour héberger :
- **Next.js** (frontend + backend) → hébergé sur **Vercel** (gratuit)
- **Supabase** (base de données Postgres + authentification Google + stockage des images) → gratuit
- **Stripe** pour les paiements réels et sécurisés (gratuit à l'inscription, commission uniquement sur les ventes)

---

## ✅ Ce qui est réellement terminé

- Boutique avec recherche, filtres (catégorie, taille, prix), fiches produit avec choix taille/couleur et stock réel.
- Panier, page de commande (formulaire inspiré de ta capture d'écran), numéro de commande généré automatiquement.
- **Paiement réellement sécurisé** via Stripe Checkout : aucune donnée bancaire ne passe par ton serveur, les clés secrètes restent côté serveur, le paiement n'est confirmé que par le **webhook Stripe** (signature vérifiée), jamais par une simple redirection côté client.
- Panneau admin **protégé côté serveur** (pas juste un bouton caché) : chaque page et chaque route admin vérifie la session ET la présence de l'email dans la table `admins` en base de données.
- Gestion des commandes (recherche, filtres, changement de statut : préparation / expédiée / livrée / annulée).
- Gestion des vêtements : ajout/modification/suppression, upload de photos, tailles, couleurs, stock par taille/couleur, prix promo, mise en avant, visibilité.
- Tableau de bord avec vraies statistiques (chiffre d'affaires réellement encaissé, calculé uniquement sur les commandes payées).
- Espace client : connexion Google, historique de commandes (visible uniquement par son propriétaire, protégé au niveau de la base de données).
- Gestion des administrateurs depuis le panneau (ajouter/retirer un email, sans toucher au code).
- Commande possible avec ou sans compte (invité).

## ⚠️ Ce qu'il reste à configurer (ne peut pas être fait à ta place)

- Créer tes comptes Supabase, Stripe et Vercel, et renseigner les vraies clés (étapes ci-dessous).
- Relier ton compte bancaire **Boursobank** dans Stripe (Stripe virera l'argent dessus automatiquement).
- Email de confirmation de commande au client : pas encore branché (demande un service d'envoi d'email comme Resend, gratuit aussi — dis-moi si tu veux que je l'ajoute).
- Design : structure professionnelle en place, mais tu voudras sûrement ajuster les couleurs/polices à ton goût une fois en ligne.

---

## 🚀 Installation, étape par étape

### 1. Supabase (base de données + connexion Google)
1. Crée un compte sur [supabase.com](https://supabase.com) → **New project** (gratuit, pas de carte demandée).
2. Dans **SQL Editor**, colle le contenu de `supabase/schema.sql` et clique sur **Run**. Ça crée toutes les tables, la sécurité, et t'ajoute déjà comme premier admin.
3. Dans **Authentication → Providers**, active **Google**. Tu auras besoin d'un Client ID/Secret Google (gratuit) : suis le lien "Google" fourni par Supabase, qui explique comment le créer sur [console.cloud.google.com](https://console.cloud.google.com).
4. Dans **Authentication → URL Configuration**, ajoute l'URL de ton site (ex: `https://ungriff.vercel.app`) dans "Redirect URLs".
5. Dans **Project Settings → API**, copie `Project URL`, `anon public key` et `service_role key` (secrète) pour l'étape 4.

### 2. Stripe (paiements)
1. Crée un compte sur [stripe.com](https://stripe.com) (gratuit).
2. Reste en **mode Test** pour l'instant (interrupteur en haut à droite du dashboard).
3. Dans **Developers → API keys**, copie la clé publique (`pk_test_...`) et la clé secrète (`sk_test_...`).
4. Une fois le site déployé (étape 3), va dans **Developers → Webhooks → Add endpoint**, mets `https://TON-SITE.vercel.app/api/webhook/stripe`, sélectionne l'événement `checkout.session.completed` (+ `checkout.session.expired` et `payment_intent.payment_failed`), puis copie le `Signing secret` (`whsec_...`).
5. Pour tester un paiement sans vraie carte : utilise le numéro `4242 4242 4242 4242`, une date future, n'importe quel CVC.
6. **Quand tu es prêt à vendre réellement** : dans **Settings → Business settings**, active ton compte (infos entreprise/particulier), puis dans **Settings → Bank accounts**, ajoute ton IBAN **Boursobank**. Repasse en mode Live et régénère des clés `pk_live_`/`sk_live_` + un nouveau webhook en mode Live.

### 3. Déploiement sur Vercel (gratuit)
1. Mets ce projet sur un dépôt GitHub (ex: `ungriff`).
2. Va sur [vercel.com](https://vercel.com) → **Add New Project** → importe ton dépôt GitHub (gratuit, pas de carte demandée).
3. Dans **Environment Variables**, ajoute toutes les variables de `.env.example` avec tes vraies valeurs (Supabase + Stripe), et `NEXT_PUBLIC_SITE_URL` = l'URL que Vercel va te donner.
4. Déploie. Une fois en ligne, reviens faire l'étape 4 ci-dessus (webhook Stripe) avec la vraie URL.

### 4. Premier compte administrateur
Le script `schema.sql` a déjà ajouté `m6739376@gmail.com` comme admin. Connecte-toi sur `/admin` avec ce compte Google : tu arrives directement sur le panneau. Tu peux ensuite ajouter d'autres admins depuis l'onglet **Administrateurs**.

### 5. Lancer en local pour tester avant de publier
\`\`\`bash
npm install
cp .env.example .env.local   # puis remplis .env.local avec tes vraies clés de TEST
npm run dev
\`\`\`
Pour recevoir les webhooks Stripe en local, installe la [Stripe CLI](https://stripe.com/docs/stripe-cli) puis lance `stripe listen --forward-to localhost:3000/api/webhook/stripe` (elle te donne un `whsec_` temporaire à mettre dans `.env.local`).

---

## 🔒 Sécurité — ce qu'il faut savoir

- Aucune clé secrète n'est dans le code : tout passe par des variables d'environnement, jamais commitées.
- Le panneau admin est vérifié **côté serveur** à chaque requête (session + email dans la table `admins`), pas seulement caché dans l'interface.
- Les prix sont **toujours recalculés côté serveur** à partir de la base de données au moment du paiement — un client ne peut jamais modifier un prix en trafiquant le navigateur.
- Une commande n'est marquée "payée" **que** lorsque Stripe confirme le
