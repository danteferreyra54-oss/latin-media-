-- Ejecutar en el SQL Editor de Supabase (Dashboard > SQL Editor).
-- Esquema de la tabla "articulos", alineada al contrato ArticuloAPI / ArticuloHome
-- definido en src/types/article.ts.

create table if not exists public.articulos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  bajada text not null,
  cuerpo text not null default '',
  seccion text not null check (
    seccion in ('Política', 'Economía', 'Policiales', 'Sociedad', 'Espectáculos', 'Virales', 'Provincias')
  ),
  kicker text not null,
  autor text not null,
  fecha timestamptz not null,
  fuente text not null,
  imagen text not null default '' check (imagen in ('', 'a2', 'a3', 'a4', 'a5')),
  created_at timestamptz not null default now()
);

create index if not exists articulos_fecha_idx on public.articulos (fecha desc);
create index if not exists articulos_seccion_fecha_idx on public.articulos (seccion, fecha desc);

alter table public.articulos enable row level security;

-- La home lee con la publishable/anon key: permitir SELECT público.
create policy "Articulos son visibles públicamente"
  on public.articulos for select
  to anon, authenticated
  using (true);

-- Los INSERT/UPDATE/DELETE quedan sin policy: solo se podrán hacer
-- con la service_role key (por ej. desde el futuro endpoint POST /api/articles
-- que consume el pipeline de n8n), que bypassea RLS.
