-- ============================================
-- SecureGuard Pro - Database Schema
-- Safe to run multiple times (idempotent)
-- ============================================

-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null default '',
  role text not null default 'guard' check (role in ('developer', 'company', 'client', 'guard')),
  phone text,
  avatar_url text,
  company_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create app_settings table (single row for global config)
create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  company_name text default 'SecureGuard Pro',
  company_logo_url text default '',
  primary_color text default '#1a1a2e',
  secondary_color text default '#16213e',
  accent_color text default '#4fc3f7',
  button_color text default '#302b63',
  smtp_host text default '',
  smtp_port int default 587,
  smtp_user text default '',
  smtp_password text default '',
  smtp_from_email text default '',
  smtp_from_name text default '',
  smtp_secure boolean default true,
  updated_at timestamptz default now()
);

-- Insert default settings row
insert into public.app_settings (id) values (1) on conflict (id) do nothing;

-- 3. Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;

-- 4. RLS Policies - Profiles (drop first, then create)

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Developers can insert profiles" on public.profiles;
create policy "Developers can insert profiles"
  on public.profiles for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'developer'
    )
  );

drop policy if exists "Developers can delete profiles" on public.profiles;
create policy "Developers can delete profiles"
  on public.profiles for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'developer'
    )
  );

-- 5. RLS Policies - App Settings (drop first, then create)

drop policy if exists "App settings are viewable by everyone" on public.app_settings;
create policy "App settings are viewable by everyone"
  on public.app_settings for select
  using (true);

drop policy if exists "Developers can update app settings" on public.app_settings;
create policy "Developers can update app settings"
  on public.app_settings for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'developer'
    )
  );

drop policy if exists "Developers can insert app settings" on public.app_settings;
create policy "Developers can insert app settings"
  on public.app_settings for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'developer'
    )
  );

-- 6. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'guard')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists on_settings_updated on public.app_settings;
create trigger on_settings_updated
  before update on public.app_settings
  for each row execute function public.handle_updated_at();

-- ============================================
-- SETUP INSTRUCTIONS:
--
-- 1. Run this entire SQL in Supabase SQL Editor
--
-- 2. Create a Storage bucket called "logos":
--    Storage > New Bucket > Name: logos > Public: ON
--
-- 3. Create test users in Auth > Users:
--    - developer@secureguard.com (password123)
--    - company@secureguard.com   (password123)
--    - client@secureguard.com    (password123)
--    - guard@secureguard.com     (password123)
--
-- 4. Update roles:
--    UPDATE profiles SET role = 'developer' WHERE email = 'developer@secureguard.com';
--    UPDATE profiles SET role = 'company' WHERE email = 'company@secureguard.com';
--    UPDATE profiles SET role = 'client' WHERE email = 'client@secureguard.com';
--    UPDATE profiles SET role = 'guard' WHERE email = 'guard@secureguard.com';
-- ============================================
