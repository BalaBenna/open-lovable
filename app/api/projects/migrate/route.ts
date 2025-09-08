import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST() {
  // Idempotent migration endpoint (dev convenience)
  const sql = `
-- First, handle existing projects table (might have user_id instead of owner_id)
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'user_id') then
    -- Rename user_id to owner_id if it exists
    alter table public.projects rename column user_id to owner_id;
  elsif not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'owner_id') then
    -- Add owner_id column if it doesn't exist
    alter table public.projects add column owner_id uuid;
  end if;
end $$;

-- Create tables if they don't exist
create table if not exists public.projects (
  id text primary key,
  title text not null,
  created_at timestamptz not null default now(),
  owner_id uuid
);

create table if not exists public.files (
  id bigserial primary key,
  project_id text not null references public.projects(id) on delete cascade,
  path text not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique(project_id, path)
);

create table if not exists public.revisions (
  id bigserial primary key,
  file_id bigint not null references public.files(id) on delete cascade,
  author_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.projects enable row level security;
alter table public.files enable row level security;
alter table public.revisions enable row level security;

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "anon_select_projects" on public.projects;
drop policy if exists "anon_insert_projects" on public.projects;
drop policy if exists "anon_select_files" on public.files;
drop policy if exists "anon_insert_files" on public.files;
drop policy if exists "anon_update_files" on public.files;

-- Create new policies
create policy "anon_select_projects" on public.projects for select to anon using (owner_id is null or owner_id = auth.uid());
create policy "anon_insert_projects" on public.projects for insert to anon with check (owner_id = auth.uid());
create policy "anon_select_files" on public.files for select using (
  exists (select 1 from public.projects p where p.id = project_id and (p.owner_id is null or p.owner_id = auth.uid()))
);
create policy "anon_insert_files" on public.files for insert with check (
  exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "anon_update_files" on public.files for update using (
  exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);

-- Realtime publications
alter publication supabase_realtime add table public.files;

select pg_notify('pgrst','reload schema');
`;

  try {
    const admin = getSupabaseAdmin();
    // Use SQL RPC via postgres-js not available; use REST / query via pg function fallback
    const { error } = await admin.rpc('exec_sql', { sql });
    if (error) {
      // If helper function not present, attempt via SQL over http (not supported). Return SQL for manual run.
      return NextResponse.json({ success: false, message: 'Run this SQL in Supabase SQL editor', sql });
    }
    return NextResponse.json({ success: true });
  } catch (e:any) {
    return NextResponse.json({ success: false, message: e.message, sql }, { status: 500 });
  }
}

export async function GET() {
  // Return the SQL so you can paste it into Supabase SQL editor
  const sql = `
-- First, handle existing projects table (might have user_id instead of owner_id)
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'user_id') then
    -- Rename user_id to owner_id if it exists
    alter table public.projects rename column user_id to owner_id;
  elsif not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'owner_id') then
    -- Add owner_id column if it doesn't exist
    alter table public.projects add column owner_id uuid;
  end if;
end $$;

-- Create tables if they don't exist
create table if not exists public.projects (
  id text primary key,
  title text not null,
  created_at timestamptz not null default now(),
  owner_id uuid
);

create table if not exists public.files (
  id bigserial primary key,
  project_id text not null references public.projects(id) on delete cascade,
  path text not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique(project_id, path)
);

create table if not exists public.revisions (
  id bigserial primary key,
  file_id bigint not null references public.files(id) on delete cascade,
  author_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.projects enable row level security;
alter table public.files enable row level security;
alter table public.revisions enable row level security;

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "anon_select_projects" on public.projects;
drop policy if exists "anon_insert_projects" on public.projects;
drop policy if exists "anon_select_files" on public.files;
drop policy if exists "anon_insert_files" on public.files;
drop policy if exists "anon_update_files" on public.files;

-- Create new policies
create policy "anon_select_projects" on public.projects for select to anon using (owner_id is null or owner_id = auth.uid());
create policy "anon_insert_projects" on public.projects for insert to anon with check (owner_id = auth.uid());
create policy "anon_select_files" on public.files for select using (
  exists (select 1 from public.projects p where p.id = project_id and (p.owner_id is null or p.owner_id = auth.uid()))
);
create policy "anon_insert_files" on public.files for insert with check (
  exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "anon_update_files" on public.files for update using (
  exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);

-- Realtime publications
alter publication supabase_realtime add table public.files;

select pg_notify('pgrst','reload schema');
`;
  return new Response(sql, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

