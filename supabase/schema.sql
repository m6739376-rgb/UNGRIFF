-- ============================================================
-- SCHÉMA UNGRIFF — à coller dans Supabase : SQL Editor -> New query -> Run
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- ADMINS ----------
-- Liste blanche des emails administrateurs. Une table, pas une adresse codée en dur.
create table if not exists admins (
  email text primary key,
  added_at timestamptz default now()
);

insert into admins (email) values ('m6739376@gmail.com')
  on conflict (email) do nothing;

-- ---------- PRODUITS ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  price numeric(10,2) not null check (price >= 0),
  promo_price numeric(10,2) check (promo_price is null or promo_price >= 0),
  category text not null default 'Autre',
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  images text[] not null default '{}',
  stock jsonb not null default '{}',      -- ex: {"M-Noir": 5, "L-Noir": 2}
  featured boolean not null default false,
  visible boolean not null default true,
  created_at timestamptz default now()
);

-- ---------- COMMANDES ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id),           -- null si commande invité
  email text not null,
  full_name text not null,
  address1 text not null,
  address2 text default '',
  country text not null,
  zip text not null,
  city text not null,
  phone text default '',
  items jsonb not null,                               -- snapshot des produits commandés
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null,
  total numeric(10,2) not null,
  status text not null default 'en_attente',           -- en_attente | preparation | expediee | livree | annulee
  payment_status text not null default 'non_paye',      -- non_paye | paye | echoue | rembourse
  stripe_session_id text,
  stripe_payment_intent text,
  created_at timestamptz default now()
);

create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_session on orders(stripe_session_id);

-- ============================================================
-- SÉCURITÉ (Row Level Security) — appliquée par la base de données elle-même,
-- impossible à contourner depuis le navigateur.
-- ============================================================
alter table products enable row level security;
alter table orders enable row level security;
alter table admins enable row level security;

-- Produits : tout le monde peut LIRE les produits visibles. Personne (client) ne peut écrire.
-- Les écritures admin passent uniquement par les routes serveur (clé service_role, qui ignore RLS).
create policy "produits visibles publics" on products for select
  using (visible = true);

-- Commandes : un client connecté ne peut voir QUE ses propres commandes.
-- Aucune écriture autorisée côté client : la création passe par /api/checkout (service_role).
create policy "mes commandes uniquement" on orders for select
  using (auth.uid() = user_id);

-- Table admins : personne ne peut la lire depuis le navigateur (vérification faite côté serveur uniquement).
-- Aucune policy select définie = accès refusé par défaut pour anon/authenticated.

-- ============================================================
-- STOCKAGE DES IMAGES (photos de vêtements)
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('products', 'products', true)
  on conflict (id) do nothing;

-- Tout le monde peut VOIR les images (nécessaire pour les afficher sur le site public)
create policy "images produits publiques" on storage.objects for select
  using (bucket_id = 'products');

-- Seuls les administrateurs connectés peuvent envoyer/supprimer des images
create policy "upload images admin uniquement" on storage.objects for insert
  with check (
    bucket_id = 'products'
    and exists (select 1 from admins where admins.email = auth.jwt() ->> 'email')
  );

create policy "suppression images admin uniquement" on storage.objects for delete
  using (
    bucket_id = 'products'
    and exists (select 1 from admins where admins.email = auth.jwt() ->> 'email')
  );
