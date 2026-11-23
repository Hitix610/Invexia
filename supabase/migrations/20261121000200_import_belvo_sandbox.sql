begin;

-- Las cuentas de prueba se guardan por vínculo y conservan el saldo y la moneda de Belvo.
create table public.belvo_sandbox_accounts (
  ambiente text not null default 'sandbox' check (ambiente = 'sandbox'),
  belvo_link_id uuid not null,
  belvo_account_id uuid not null,
  nombre text,
  tipo text,
  moneda text check (moneda ~ '^[A-Z]{3}$'),
  saldo numeric,
  actualizado_en timestamptz not null default now(),
  primary key (belvo_link_id, belvo_account_id),
  foreign key (ambiente, belvo_link_id)
    references public.belvo_links (ambiente, belvo_link_id) on delete cascade
);

-- Cada movimiento de prueba pertenece a una cuenta del mismo vínculo.
create table public.belvo_sandbox_transactions (
  belvo_link_id uuid not null,
  belvo_transaction_id uuid not null,
  belvo_account_id uuid not null,
  tipo text not null check (tipo in ('ingreso', 'gasto')),
  monto numeric not null check (monto >= 0),
  moneda text check (moneda ~ '^[A-Z]{3}$'),
  fecha date not null,
  descripcion text,
  comercio text,
  estado text,
  actualizado_en timestamptz not null default now(),
  primary key (belvo_link_id, belvo_transaction_id),
  foreign key (belvo_link_id, belvo_account_id)
    references public.belvo_sandbox_accounts (belvo_link_id, belvo_account_id) on delete cascade
);

-- Acelera la consulta de los movimientos más recientes de un vínculo.
create index belvo_sandbox_transactions_fecha_idx
  on public.belvo_sandbox_transactions (belvo_link_id, fecha desc, belvo_transaction_id);

-- La API de Fintrack verifica la sesión y el propietario antes de leer o importar.
alter table public.belvo_sandbox_accounts enable row level security;
alter table public.belvo_sandbox_transactions enable row level security;
revoke all on public.belvo_sandbox_accounts, public.belvo_sandbox_transactions from public, anon, authenticated;
grant select, insert, update on public.belvo_sandbox_accounts, public.belvo_sandbox_transactions to service_role;

-- Guarda cuentas y movimientos juntos y actualiza los registros si se repite la importación.
create function public.import_belvo_sandbox(
  p_usuario_id uuid,
  p_link_id uuid,
  p_cuentas jsonb,
  p_movimientos jsonb
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  -- Serializa las importaciones por vínculo y comprueba que pertenece al usuario indicado.
  perform pg_advisory_xact_lock(hashtextextended(p_link_id::text, 0));
  perform 1 from public.belvo_links
    where ambiente = 'sandbox' and belvo_link_id = p_link_id and usuario_id = p_usuario_id;
  if not found then
    raise exception 'Vínculo Sandbox no disponible para este usuario' using errcode = '42501';
  end if;

  -- Las cuentas se guardan primero para que los movimientos puedan referenciarlas.
  insert into public.belvo_sandbox_accounts
    (belvo_link_id, belvo_account_id, nombre, tipo, moneda, saldo)
    select p_link_id, a.id, a.nombre, a.tipo, a.moneda, a.saldo
    from jsonb_to_recordset(p_cuentas) as a(id uuid, nombre text, tipo text, moneda text, saldo numeric)
    on conflict (belvo_link_id, belvo_account_id) do update
      set nombre = excluded.nombre, tipo = excluded.tipo, moneda = excluded.moneda,
          saldo = excluded.saldo, actualizado_en = now();

  -- La clave por vínculo y movimiento permite repetir la sincronización sin duplicados.
  insert into public.belvo_sandbox_transactions
    (belvo_link_id, belvo_transaction_id, belvo_account_id, tipo, monto, moneda,
     fecha, descripcion, comercio, estado)
    select p_link_id, t.id, t.cuenta_id, t.tipo, t.monto, t.moneda,
           t.fecha, t.descripcion, t.comercio, t.estado
    from jsonb_to_recordset(p_movimientos) as t(
      id uuid, cuenta_id uuid, tipo text, monto numeric, moneda text,
      fecha date, descripcion text, comercio text, estado text
    )
    on conflict (belvo_link_id, belvo_transaction_id) do update
      set belvo_account_id = excluded.belvo_account_id, tipo = excluded.tipo, monto = excluded.monto,
          moneda = excluded.moneda, fecha = excluded.fecha, descripcion = excluded.descripcion,
          comercio = excluded.comercio, estado = excluded.estado, actualizado_en = now();
end;
$$;

-- Solo el rol de servidor puede ejecutar el procedimiento de importación.
revoke execute on function public.import_belvo_sandbox(uuid, uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.import_belvo_sandbox(uuid, uuid, jsonb, jsonb) to service_role;

commit;
