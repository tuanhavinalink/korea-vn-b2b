-- ============================================================
-- Korea-VN B2B Platform — Supabase Schema
-- Run this in Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── Profiles / Roles ────────────────────────────────────────
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('admin', 'korean', 'vn')),
  company_id uuid, -- for korean users
  created_at timestamptz default now()
);

-- ─── Korean Companies ────────────────────────────────────────
create table korean_companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text,
  business_sector text not null,
  description text,
  video_url text,        -- YouTube embed link
  catalog_url text,      -- Google Drive or external link
  contact_email text,
  website text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Products ────────────────────────────────────────────────
create table products (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references korean_companies(id) on delete cascade not null,
  name text not null,
  description text,
  image_urls text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── Vietnamese Members ──────────────────────────────────────
create table vn_members (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  company_name text,
  position text,
  phone text,
  email text unique not null,
  website text,
  business_sector text,
  partnership_needs text,
  created_at timestamptz default now()
);

-- ─── Favorites (Love) ────────────────────────────────────────
create table favorites (
  id uuid default gen_random_uuid() primary key,
  vn_member_id uuid references vn_members(id) on delete cascade not null,
  company_id uuid references korean_companies(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now(),
  constraint must_have_target check (company_id is not null or product_id is not null),
  unique(vn_member_id, company_id, product_id)
);

-- ─── Zoom Events ─────────────────────────────────────────────
create table zoom_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  event_date timestamptz not null,
  duration_minutes int default 60,
  zoom_link text,
  zalo_link text,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- ─── Event Interests ─────────────────────────────────────────
create table event_interests (
  id uuid default gen_random_uuid() primary key,
  vn_member_id uuid references vn_members(id) on delete cascade not null,
  event_id uuid references zoom_events(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(vn_member_id, event_id)
);

-- ─── RLS Policies ────────────────────────────────────────────
alter table profiles enable row level security;
alter table korean_companies enable row level security;
alter table products enable row level security;
alter table vn_members enable row level security;
alter table favorites enable row level security;
alter table zoom_events enable row level security;
alter table event_interests enable row level security;

-- Public can read active companies
create policy "Public read companies" on korean_companies
  for select using (is_active = true);

-- Public can read products of active companies
create policy "Public read products" on products
  for select using (is_active = true);

-- Public can read published events
create policy "Public read events" on zoom_events
  for select using (is_published = true);

-- VN members can read/write their own data
create policy "VN read own profile" on vn_members
  for select using (auth.uid() = id);

create policy "VN insert own profile" on vn_members
  for insert with check (auth.uid() = id);

create policy "VN read own favorites" on favorites
  for select using (auth.uid() = vn_member_id);

create policy "VN insert favorites" on favorites
  for insert with check (auth.uid() = vn_member_id);

create policy "VN delete own favorites" on favorites
  for delete using (auth.uid() = vn_member_id);

create policy "VN read own event interests" on event_interests
  for select using (auth.uid() = vn_member_id);

create policy "VN insert event interests" on event_interests
  for insert with check (auth.uid() = vn_member_id);

create policy "VN delete own event interests" on event_interests
  for delete using (auth.uid() = vn_member_id);

-- Profiles: users read own, admin reads all
create policy "Read own profile" on profiles
  for select using (auth.uid() = id);

-- ─── Admin helper function ───────────────────────────────────
-- Admin bypasses RLS using service role key in API routes

-- ─── Trigger: auto-create profile on signup ──────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  -- VN members get 'vn' role by default; Korean/admin set via admin panel
  insert into profiles (id, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'role', 'vn'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── Sample Data (optional, remove for production) ───────────
insert into korean_companies (name, business_sector, description, logo_url) values
  ('Samsung C&T', 'Construction & Trading', 'Leading Korean conglomerate', 'https://placehold.co/200x100?text=Samsung+CT'),
  ('Hyundai Steel', 'Steel Manufacturing', 'Premium steel products manufacturer', 'https://placehold.co/200x100?text=Hyundai+Steel'),
  ('LG Chem', 'Chemical & Battery', 'Advanced chemical solutions', 'https://placehold.co/200x100?text=LG+Chem'),
  ('POSCO International', 'Steel & Energy', 'Global steel and energy trading', 'https://placehold.co/200x100?text=POSCO'),
  ('Hanwha Q CELLS', 'Solar Energy', 'World-class solar energy solutions', 'https://placehold.co/200x100?text=Hanwha'),
  ('Doosan Heavy', 'Heavy Industry', 'Power plants and industrial equipment', 'https://placehold.co/200x100?text=Doosan');
