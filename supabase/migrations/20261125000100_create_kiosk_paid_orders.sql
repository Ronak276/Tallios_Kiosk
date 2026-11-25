create table if not exists public.kiosk_paid_orders (
  stripe_session_id text primary key,
  order_number text not null,
  order_mode text not null check (order_mode in ('Dine in', 'Take away')),
  total_cents integer not null check (total_cents > 0),
  currency text not null check (currency = 'usd'),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  created_at timestamptz not null default now()
);

alter table public.kiosk_paid_orders enable row level security;
revoke all on public.kiosk_paid_orders from public, anon, authenticated;
grant select, insert on public.kiosk_paid_orders to service_role;
