-- =============================================
-- Mavicure Travel Tours — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- TOURS TABLE
-- =============================================
create table if not exists tours (
  id           uuid primary key default uuid_generate_v4(),
  name_es      text not null,
  name_en      text not null,
  description_es text not null,
  description_en text not null,
  detail_es      text,
  detail_en      text,
  price_cop    bigint not null,          -- Price in COP (no decimals)
  duration_es  text not null,            -- e.g. "5 Días"
  duration_en  text not null,            -- e.g. "5 Days"
  destination  text not null,
  image_url    text not null,
  max_people   integer not null default 12,
  group_size   text not null default '2–12',
  badge_es     text,
  badge_en     text,
  badge_color  text default 'bg-emerald-500',
  rating       numeric(2,1) default 4.8,
  reviews      integer default 0,
  is_active    boolean default true,
  sort_order   integer default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- =============================================
-- BOOKINGS TABLE
-- =============================================
create table if not exists bookings (
  id                    uuid primary key default uuid_generate_v4(),
  tour_id               uuid references tours(id) on delete set null,
  tour_name             text not null,          -- Snapshot at booking time
  customer_name         text not null,
  email                 text not null,
  phone                 text not null,
  date                  date not null,
  num_people            integer not null check (num_people >= 4),
  notes                 text,
  payment_status        text not null default 'pending'
                          check (payment_status in ('pending', 'confirmed', 'cancelled')),
  total_cop             bigint not null,
  wompi_transaction_id  text,                   -- Filled after Wompi payment
  wompi_reference       text,                   -- Wompi payment reference
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- =============================================
-- TESTIMONIALS TABLE
-- =============================================
create table if not exists testimonials (
  id             uuid primary key default uuid_generate_v4(),
  tour_id        uuid references tours(id) on delete set null,
  customer_name  text not null,
  origin         text,                          -- e.g. "New York, USA"
  rating         integer not null check (rating between 1 and 5),
  comment        text not null,
  avatar_url     text,
  is_visible     boolean default false,         -- Admin approves before showing
  created_at     timestamptz default now()
);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tours_updated_at
  before update on tours
  for each row execute function update_updated_at();

create trigger bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table tours        enable row level security;
alter table bookings     enable row level security;
alter table testimonials enable row level security;

-- Public can read active tours
create policy "Public can read active tours"
  on tours for select
  using (is_active = true);

-- Public can read visible testimonials
create policy "Public can read visible testimonials"
  on testimonials for select
  using (is_visible = true);

-- Anyone can insert a booking (the API route handles validation)
create policy "Anyone can insert bookings"
  on bookings for insert
  with check (true);

-- Authenticated users (admins) have full access
create policy "Admins full access to tours"
  on tours for all
  using (auth.role() = 'authenticated');

create policy "Admins full access to bookings"
  on bookings for all
  using (auth.role() = 'authenticated');

create policy "Admins full access to testimonials"
  on testimonials for all
  using (auth.role() = 'authenticated');

-- =============================================
-- SEED DATA — Tours
-- =============================================
insert into tours (name_es, name_en, description_es, description_en, price_cop, duration_es, duration_en, destination, image_url, max_people, group_size, badge_es, badge_en, badge_color, rating, reviews)
values
  ('Expedición Cerros de Mavicure', 'Mavicure Hills Expedition',
   'Trekking por las místicas colinas de granito de Mavicure en el corazón del Amazonas, con guías indígenas expertos.',
   'Trek through the mystical granite hills of Mavicure in the heart of the Amazon, guided by indigenous experts.',
   3900000, '5 Días', '5 Days', 'Guainía, Colombia',
   'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80',
   12, '4–12', 'Más Vendido', 'Best Seller', 'bg-emerald-500', 4.9, 128),

  ('Tour Ciudad Amurallada Cartagena', 'Cartagena Old City Walk',
   'Descubre los vibrantes colores, la arquitectura colonial y la cultura caribeña de Cartagena, Patrimonio UNESCO.',
   'Discover the vibrant colors, colonial architecture, and Caribbean culture of UNESCO-listed Cartagena.',
   1980000, '3 Días', '3 Days', 'Cartagena, Colombia',
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
   16, '2–16', 'Popular', 'Popular', 'bg-amber-500', 4.8, 214),

  ('Retiro en la Región Cafetera', 'Coffee Region Retreat',
   'Sumérgete en fincas cafeteras exuberantes, coloridos jeep rides por los Andes y degustaciones de café de clase mundial.',
   'Immerse yourself in lush coffee farms, colorful jeep rides through the Andes, and world-class coffee tasting.',
   2720000, '4 Días', '4 Days', 'Eje Cafetero, Colombia',
   'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
   10, '2–10', 'Nuevo', 'New', 'bg-blue-500', 4.9, 97),

  ('Selva y Playa Tayrona', 'Tayrona Jungle & Beach',
   'Camina por la selva densa hasta llegar a playas escondidas dentro del Parque Nacional Natural Tayrona.',
   'Hike through dense jungle to reach pristine hidden beaches inside Tayrona National Park.',
   2280000, '3 Días', '3 Days', 'Santa Marta, Colombia',
   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
   14, '4–14', 'Aventura', 'Adventure', 'bg-orange-500', 4.7, 183),

  ('Eco Aventura Amazónica', 'Amazon Eco Adventure',
   'Una inmersión profunda en el Amazonas colombiano — avistamiento de fauna, expediciones fluviales y noches en la selva.',
   'A deep-dive into the Colombian Amazon — wildlife spotting, river expeditions, and rainforest nights.',
   5500000, '7 Días', '7 Days', 'Leticia, Colombia',
   'https://images.unsplash.com/photo-1504884790557-80daa3a9e621?w=800&q=80',
   10, '4–10', 'Premium', 'Premium', 'bg-purple-500', 5.0, 62),

  ('Bogotá Ciudad y Cerros', 'Bogotá City & Cerros',
   'Explora el arte urbano de La Candelaria, el pico de Monserrate y el oro del Museo del Oro.',
   'Explore La Candelaria''s street art, Monserrate peak, and the gold of the Museo del Oro.',
   1230000, '2 Días', '2 Days', 'Bogotá, Colombia',
   'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80',
   20, '2–20', 'City Break', 'City Break', 'bg-teal-500', 4.6, 309);

-- =============================================
-- SETTINGS TABLE (payment gateway credentials)
-- =============================================
create table if not exists settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz default now()
);

alter table settings enable row level security;

create policy "Admins only on settings"
  on settings for all
  using (auth.role() = 'authenticated');

-- =============================================
-- MIGRATION: Multi-gateway payment columns
-- Run this if you already created the bookings table
-- =============================================
alter table bookings
  add column if not exists payment_gateway  text,        -- 'wompi' | 'payu' | 'mercadopago' | 'paypal'
  add column if not exists payment_method   text,        -- 'card' | 'pse' | 'nequi' | etc.
  add column if not exists payment_reference text,       -- gateway-specific reference/order ID
  add column if not exists email_sent       boolean default false;

-- =============================================
-- PAGE CONTENT (CMS)
-- =============================================
create table if not exists page_content (
  id         uuid primary key default uuid_generate_v4(),
  page       text not null,   -- home, tours, nosotros, reservar, contacto
  section    text not null,   -- Hero, Sobre nosotros, etc.
  key        text not null,   -- hero_image, hero_title, etc.
  value_es   text default '',
  value_en   text default '',
  updated_at timestamptz default now(),
  unique (page, key)
);

alter table page_content enable row level security;

create policy "Public can read page_content"
  on page_content for select using (true);

create policy "Admins full access to page_content"
  on page_content for all using (auth.role() = 'authenticated');

-- Seed: default WhatsApp pre-loaded message
insert into page_content (page, section, key, value_es, value_en)
values ('global', 'Información de contacto', 'whatsapp_message',
  'Hola, me interesa información sobre los tours de Colombia',
  'Hello, I am interested in information about Colombia tours')
on conflict (page, key) do nothing;
