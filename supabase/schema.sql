-- ============================================
-- SecureGuard Pro - Database Schema
-- Run this in your Supabase SQL Editor
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

-- 2. Enable Row Level Security
alter table public.profiles enable row level security;

-- 3. RLS Policies

-- Everyone can read all profiles (needed for guard lists, etc.)
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can update their own profile
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Developers can insert profiles (for user management)
create policy "Developers can insert profiles"
  on public.profiles for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'developer'
    )
  );

-- Developers can delete profiles
create policy "Developers can delete profiles"
  on public.profiles for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'developer'
    )
  );

-- 4. Auto-create profile on signup
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

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Auto-update updated_at
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

-- ============================================
-- SEED DATA: Create test users
-- After running this schema, create users in
-- Supabase Auth Dashboard with these emails:
--
-- 1. developer@secureguard.com (role: developer)
-- 2. company@secureguard.com   (role: company)
-- 3. client@secureguard.com    (role: client)
-- 4. guard@secureguard.com     (role: guard)
--
-- Use any password (e.g., "password123")
-- The trigger will auto-create profiles.
--
-- Then update their roles manually:
-- UPDATE profiles SET role = 'developer' WHERE email = 'developer@secureguard.com';
-- UPDATE profiles SET role = 'company' WHERE email = 'company@secureguard.com';
-- UPDATE profiles SET role = 'client' WHERE email = 'client@secureguard.com';
-- UPDATE profiles SET role = 'guard' WHERE email = 'guard@secureguard.com';
-- ============================================
