-- Asocia cada vínculo de Belvo Sandbox con un usuario de Fintrack.
create table public.belvo_links (
  ambiente text not null check (ambiente = 'sandbox'),
  belvo_link_id uuid not null,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  institucion text not null,
  creado_en timestamptz not null default now(),
  primary key (ambiente, belvo_link_id)
);

-- El backend verifica al propietario antes de registrar o consultar el vínculo.
alter table public.belvo_links enable row level security;
revoke all on table public.belvo_links from public, anon, authenticated;
grant select, insert on table public.belvo_links to service_role;
