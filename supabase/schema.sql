-- À exécuter une fois dans Supabase → SQL Editor

create table if not exists public.movies (
  id          uuid primary key default gen_random_uuid(),
  tmdb_id     integer,
  title       text not null,
  year        text,
  overview    text,
  -- { "es": { "title": "...", "overview": "..." }, "fr": { ... } }
  translations jsonb,
  poster_path text,
  added_by    text,
  added_at    timestamptz not null default now(),
  status      text not null default 'wishlist'
              check (status in ('wishlist', 'planned', 'watched')),
  watched_at  timestamptz,
  rating      smallint check (rating between 1 and 5)
);

create table if not exists public.sessions (
  id        uuid primary key default gen_random_uuid(),
  movie_id  uuid not null references public.movies (id) on delete cascade,
  starts_at timestamptz not null
);

-- Sécurité : seuls les utilisateurs connectés (vous deux) ont accès
alter table public.movies   enable row level security;
alter table public.sessions enable row level security;

create policy "authenticated full access" on public.movies
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on public.sessions
  for all to authenticated using (true) with check (true);

-- Temps réel : quand l'un ajoute un film, l'autre le voit tout de suite
alter publication supabase_realtime add table public.movies;
alter publication supabase_realtime add table public.sessions;
