create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'staff' check (role in ('manager','staff')),
  created_at timestamptz not null default now()
);

create or replace function public.create_profile() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id, full_name, email, role)
  values(new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.email,''), 'staff')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile();

create table if not exists warehouses (
  id uuid primary key default gen_random_uuid(), name text not null,
  short_code text not null unique, address text not null default '', created_at timestamptz not null default now()
);
create table if not exists locations (
  id uuid primary key default gen_random_uuid(), warehouse_id uuid not null references warehouses(id) on delete restrict,
  name text not null, short_code text not null, created_at timestamptz not null default now(),
  unique(warehouse_id, short_code), unique(id, warehouse_id)
);
create table if not exists categories (
  id uuid primary key default gen_random_uuid(), name text not null unique, description text not null default ''
);
create table if not exists products (
  id uuid primary key default gen_random_uuid(), name text not null, sku text not null unique,
  category_id uuid references categories(id), unit text not null default 'units',
  unit_cost numeric(14,2) not null default 0 check (unit_cost >= 0),
  sales_price numeric(14,2) not null default 0 check (sales_price >= 0),
  reorder_level numeric(14,2) not null default 0 check (reorder_level >= 0),
  description text not null default '', is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists inventory (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references products(id),
  warehouse_id uuid not null, location_id uuid not null,
  quantity_on_hand numeric(14,2) not null default 0 check (quantity_on_hand >= 0),
  quantity_reserved numeric(14,2) not null default 0 check (quantity_reserved >= 0 and quantity_reserved <= quantity_on_hand),
  updated_at timestamptz not null default now(),
  unique(product_id, location_id), foreign key(location_id,warehouse_id) references locations(id,warehouse_id)
);
create table if not exists receipts (
  id uuid primary key default gen_random_uuid(), reference text not null unique,
  vendor_name text not null, warehouse_id uuid not null references warehouses(id),
  location_id uuid not null, scheduled_date date not null default current_date,
  source_document text not null default '', status text not null default 'draft'
    check(status in ('draft','waiting','ready','done','canceled')),
  responsible_user uuid references profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(location_id,warehouse_id) references locations(id,warehouse_id)
);
create table if not exists receipt_items (
  id uuid primary key default gen_random_uuid(), receipt_id uuid not null references receipts(id) on delete cascade,
  product_id uuid not null references products(id), expected_quantity numeric(14,2) not null check(expected_quantity > 0),
  received_quantity numeric(14,2) not null check(received_quantity >= 0), unique(receipt_id, product_id)
);
create table if not exists deliveries (
  id uuid primary key default gen_random_uuid(), reference text not null unique,
  customer_name text not null, warehouse_id uuid not null references warehouses(id),
  location_id uuid not null, scheduled_date date not null default current_date,
  source_document text not null default '', status text not null default 'draft'
    check(status in ('draft','waiting','ready','done','canceled')),
  responsible_user uuid references profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(location_id,warehouse_id) references locations(id,warehouse_id)
);
create table if not exists delivery_items (
  id uuid primary key default gen_random_uuid(), delivery_id uuid not null references deliveries(id) on delete cascade,
  product_id uuid not null references products(id), requested_quantity numeric(14,2) not null check(requested_quantity > 0),
  delivered_quantity numeric(14,2) not null check(delivered_quantity > 0), unique(delivery_id, product_id)
);
create table if not exists transfers (
  id uuid primary key default gen_random_uuid(), reference text not null unique,
  source_warehouse_id uuid not null references warehouses(id), source_location_id uuid not null,
  destination_warehouse_id uuid not null references warehouses(id), destination_location_id uuid not null,
  scheduled_date date not null default current_date, notes text not null default '',
  status text not null default 'draft' check(status in ('draft','waiting','ready','done','canceled')),
  responsible_user uuid references profiles(id), created_at timestamptz not null default now(),
  foreign key(source_location_id,source_warehouse_id) references locations(id,warehouse_id),
  foreign key(destination_location_id,destination_warehouse_id) references locations(id,warehouse_id),
  check(source_location_id <> destination_location_id)
);
create table if not exists transfer_items (
  id uuid primary key default gen_random_uuid(), transfer_id uuid not null references transfers(id) on delete cascade,
  product_id uuid not null references products(id), quantity numeric(14,2) not null check(quantity > 0),
  unique(transfer_id,product_id)
);
create table if not exists adjustments (
  id uuid primary key default gen_random_uuid(), reference text not null unique,
  warehouse_id uuid not null references warehouses(id), location_id uuid not null,
  product_id uuid not null references products(id), system_quantity numeric(14,2),
  counted_quantity numeric(14,2) not null check(counted_quantity >= 0),
  difference numeric(14,2), reason text not null check(reason in ('Physical Count','Damaged','Lost','Correction','Other')),
  notes text not null default '', status text not null default 'draft' check(status in ('draft','done','canceled')),
  responsible_user uuid references profiles(id), created_at timestamptz not null default now(),
  foreign key(location_id,warehouse_id) references locations(id,warehouse_id)
);
create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(), reference text not null,
  product_id uuid not null references products(id),
  movement_type text not null check(movement_type in ('receipt','delivery','transfer','adjustment')),
  source_warehouse_id uuid references warehouses(id), source_location_id uuid references locations(id),
  destination_warehouse_id uuid references warehouses(id), destination_location_id uuid references locations(id),
  quantity numeric(14,2) not null, status text not null default 'done',
  related_document_id uuid not null, responsible_user uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_inventory_product on inventory(product_id);
create index if not exists idx_inventory_warehouse on inventory(warehouse_id);
create index if not exists idx_receipts_status_date on receipts(status,scheduled_date);
create index if not exists idx_deliveries_status_date on deliveries(status,scheduled_date);
create index if not exists idx_moves_created on stock_movements(created_at desc);
create index if not exists idx_moves_product on stock_movements(product_id);

-- The browser has no table policies. Only the authenticated Flask server uses the service key.
do $$ declare t text; begin
  foreach t in array array['profiles','warehouses','locations','categories','products','inventory',
    'receipts','receipt_items','deliveries','delivery_items','transfers','transfer_items','adjustments','stock_movements'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Authenticated viewers may subscribe to operational changes. All writes remain server-only.
do $$ declare t text; begin
  foreach t in array array['products','inventory','receipts','deliveries','transfers','stock_movements'] loop
    if not exists(select 1 from pg_policies where schemaname='public' and tablename=t and policyname='authenticated_read') then
      execute format('create policy authenticated_read on public.%I for select to authenticated using (true)',t);
    end if;
    if exists(select 1 from pg_publication where pubname='supabase_realtime')
      and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I',t);
    end if;
  end loop;
end $$;

create or replace function complete_receipt(p_id uuid) returns void language plpgsql as $$
declare d receipts%rowtype; line receipt_items%rowtype; n int := 0;
begin
  select * into d from receipts where id=p_id for update;
  if not found or d.status <> 'ready' then raise exception 'Receipt must be ready'; end if;
  for line in select * from receipt_items where receipt_id=p_id loop
    n := n+1;
    if line.received_quantity <= 0 then raise exception 'Received quantity must be positive'; end if;
    insert into inventory(product_id,warehouse_id,location_id,quantity_on_hand)
      values(line.product_id,d.warehouse_id,d.location_id,line.received_quantity)
      on conflict(product_id,location_id) do update set quantity_on_hand=inventory.quantity_on_hand+excluded.quantity_on_hand,updated_at=now();
    insert into stock_movements(reference,product_id,movement_type,destination_warehouse_id,destination_location_id,quantity,related_document_id,responsible_user)
      values(d.reference,line.product_id,'receipt',d.warehouse_id,d.location_id,line.received_quantity,d.id,d.responsible_user);
  end loop;
  if n=0 then raise exception 'At least one item required'; end if;
  update receipts set status='done',updated_at=now() where id=p_id;
end $$;

create or replace function complete_delivery(p_id uuid) returns void language plpgsql as $$
declare d deliveries%rowtype; line delivery_items%rowtype; n int := 0;
begin
  select * into d from deliveries where id=p_id for update;
  if not found or d.status <> 'ready' then raise exception 'Delivery must be ready'; end if;
  for line in select * from delivery_items where delivery_id=p_id order by product_id loop
    n := n+1;
    update inventory set quantity_on_hand=quantity_on_hand-line.delivered_quantity,updated_at=now()
      where product_id=line.product_id and location_id=d.location_id
      and quantity_on_hand-quantity_reserved >= line.delivered_quantity;
    if not found then raise exception 'Insufficient available stock for product %',line.product_id; end if;
    insert into stock_movements(reference,product_id,movement_type,source_warehouse_id,source_location_id,quantity,related_document_id,responsible_user)
      values(d.reference,line.product_id,'delivery',d.warehouse_id,d.location_id,line.delivered_quantity,d.id,d.responsible_user);
  end loop;
  if n=0 then raise exception 'At least one item required'; end if;
  update deliveries set status='done',updated_at=now() where id=p_id;
end $$;

create or replace function complete_transfer(p_id uuid) returns void language plpgsql as $$
declare d transfers%rowtype; line transfer_items%rowtype; n int := 0;
begin
  select * into d from transfers where id=p_id for update;
  if not found or d.status <> 'ready' then raise exception 'Transfer must be ready'; end if;
  for line in select * from transfer_items where transfer_id=p_id order by product_id loop
    n := n+1;
    update inventory set quantity_on_hand=quantity_on_hand-line.quantity,updated_at=now()
      where product_id=line.product_id and location_id=d.source_location_id and quantity_on_hand-quantity_reserved >= line.quantity;
    if not found then raise exception 'Insufficient available stock for product %',line.product_id; end if;
    insert into inventory(product_id,warehouse_id,location_id,quantity_on_hand)
      values(line.product_id,d.destination_warehouse_id,d.destination_location_id,line.quantity)
      on conflict(product_id,location_id) do update set quantity_on_hand=inventory.quantity_on_hand+excluded.quantity_on_hand,updated_at=now();
    insert into stock_movements(reference,product_id,movement_type,source_warehouse_id,source_location_id,destination_warehouse_id,destination_location_id,quantity,related_document_id,responsible_user)
      values(d.reference,line.product_id,'transfer',d.source_warehouse_id,d.source_location_id,d.destination_warehouse_id,d.destination_location_id,line.quantity,d.id,d.responsible_user);
  end loop;
  if n=0 then raise exception 'At least one item required'; end if;
  update transfers set status='done' where id=p_id;
end $$;

create or replace function complete_adjustment(p_id uuid) returns void language plpgsql as $$
declare d adjustments%rowtype; old_qty numeric(14,2);
begin
  select * into d from adjustments where id=p_id for update;
  if not found or d.status <> 'draft' then raise exception 'Adjustment must be draft'; end if;
  insert into inventory(product_id,warehouse_id,location_id,quantity_on_hand)
    values(d.product_id,d.warehouse_id,d.location_id,0) on conflict(product_id,location_id) do nothing;
  select quantity_on_hand into old_qty from inventory where product_id=d.product_id and location_id=d.location_id for update;
  if d.counted_quantity < (select quantity_reserved from inventory where product_id=d.product_id and location_id=d.location_id)
    then raise exception 'Counted quantity below reserved stock'; end if;
  update inventory set quantity_on_hand=d.counted_quantity,updated_at=now() where product_id=d.product_id and location_id=d.location_id;
  update adjustments set system_quantity=old_qty,difference=d.counted_quantity-old_qty,status='done' where id=p_id;
  insert into stock_movements(reference,product_id,movement_type,source_warehouse_id,source_location_id,destination_warehouse_id,destination_location_id,quantity,related_document_id,responsible_user)
    values(d.reference,d.product_id,'adjustment',d.warehouse_id,d.location_id,d.warehouse_id,d.location_id,d.counted_quantity-old_qty,d.id,d.responsible_user);
end $$;

-- Save the header and all item lines together. An invalid line rolls back the entire draft.
create or replace function save_document(p_kind text,p_data jsonb,p_id uuid,p_user uuid) returns uuid language plpgsql as $$
declare doc_id uuid; line jsonb; previous_status text;
begin
  if p_kind not in ('receipts','deliveries','transfers') then raise exception 'Unsupported document'; end if;
  if jsonb_array_length(coalesce(p_data->'items','[]'::jsonb)) = 0 then raise exception 'At least one item required'; end if;
  if p_id is not null then
    if p_kind='receipts' then select status into previous_status from receipts where id=p_id for update;
    elsif p_kind='deliveries' then select status into previous_status from deliveries where id=p_id for update;
    else select status into previous_status from transfers where id=p_id for update; end if;
    if previous_status is distinct from 'draft' then raise exception 'Only a draft can be edited'; end if;
    doc_id := p_id;
  else doc_id := gen_random_uuid(); end if;

  if p_kind='receipts' then
    if p_id is null then
      insert into receipts(id,reference,vendor_name,warehouse_id,location_id,scheduled_date,source_document,responsible_user)
      values(doc_id,p_data->>'reference',p_data->>'vendor_name',(p_data->>'warehouse_id')::uuid,(p_data->>'location_id')::uuid,
        coalesce((p_data->>'scheduled_date')::date,current_date),coalesce(p_data->>'source_document',''),p_user);
    else
      update receipts set vendor_name=p_data->>'vendor_name',warehouse_id=(p_data->>'warehouse_id')::uuid,
        location_id=(p_data->>'location_id')::uuid,scheduled_date=coalesce((p_data->>'scheduled_date')::date,current_date),
        source_document=coalesce(p_data->>'source_document',''),updated_at=now() where id=doc_id;
      delete from receipt_items where receipt_id=doc_id;
    end if;
    for line in select value from jsonb_array_elements(p_data->'items') loop
      insert into receipt_items(receipt_id,product_id,expected_quantity,received_quantity)
        values(doc_id,(line->>'product_id')::uuid,(line->>'expected_quantity')::numeric,(line->>'received_quantity')::numeric);
    end loop;
  elsif p_kind='deliveries' then
    if p_id is null then
      insert into deliveries(id,reference,customer_name,warehouse_id,location_id,scheduled_date,source_document,responsible_user)
      values(doc_id,p_data->>'reference',p_data->>'customer_name',(p_data->>'warehouse_id')::uuid,(p_data->>'location_id')::uuid,
        coalesce((p_data->>'scheduled_date')::date,current_date),coalesce(p_data->>'source_document',''),p_user);
    else
      update deliveries set customer_name=p_data->>'customer_name',warehouse_id=(p_data->>'warehouse_id')::uuid,
        location_id=(p_data->>'location_id')::uuid,scheduled_date=coalesce((p_data->>'scheduled_date')::date,current_date),
        source_document=coalesce(p_data->>'source_document',''),updated_at=now() where id=doc_id;
      delete from delivery_items where delivery_id=doc_id;
    end if;
    for line in select value from jsonb_array_elements(p_data->'items') loop
      insert into delivery_items(delivery_id,product_id,requested_quantity,delivered_quantity)
        values(doc_id,(line->>'product_id')::uuid,(line->>'requested_quantity')::numeric,(line->>'delivered_quantity')::numeric);
    end loop;
  else
    if p_id is null then
      insert into transfers(id,reference,source_warehouse_id,source_location_id,destination_warehouse_id,destination_location_id,scheduled_date,notes,responsible_user)
      values(doc_id,p_data->>'reference',(p_data->>'source_warehouse_id')::uuid,(p_data->>'source_location_id')::uuid,
        (p_data->>'destination_warehouse_id')::uuid,(p_data->>'destination_location_id')::uuid,
        coalesce((p_data->>'scheduled_date')::date,current_date),coalesce(p_data->>'notes',''),p_user);
    else
      update transfers set source_warehouse_id=(p_data->>'source_warehouse_id')::uuid,source_location_id=(p_data->>'source_location_id')::uuid,
        destination_warehouse_id=(p_data->>'destination_warehouse_id')::uuid,destination_location_id=(p_data->>'destination_location_id')::uuid,
        scheduled_date=coalesce((p_data->>'scheduled_date')::date,current_date),notes=coalesce(p_data->>'notes','') where id=doc_id;
      delete from transfer_items where transfer_id=doc_id;
    end if;
    for line in select value from jsonb_array_elements(p_data->'items') loop
      insert into transfer_items(transfer_id,product_id,quantity)
        values(doc_id,(line->>'product_id')::uuid,(line->>'quantity')::numeric);
    end loop;
  end if;
  return doc_id;
end $$;

create or replace function advance_document(p_kind text,p_id uuid,p_target text) returns void language plpgsql as $$
declare previous_status text;
begin
  if p_kind='receipts' then select status into previous_status from receipts where id=p_id for update;
  elsif p_kind='deliveries' then select status into previous_status from deliveries where id=p_id for update;
  elsif p_kind='transfers' then select status into previous_status from transfers where id=p_id for update;
  else raise exception 'Unsupported document'; end if;
  if previous_status is null then raise exception 'Document not found'; end if;
  if not ((previous_status='draft' and p_target in ('waiting','canceled'))
    or (previous_status='waiting' and p_target in ('ready','canceled'))
    or (previous_status='ready' and p_target='canceled')) then
    raise exception 'Invalid status transition from % to %',previous_status,p_target;
  end if;
  if p_kind='receipts' then update receipts set status=p_target,updated_at=now() where id=p_id;
  elsif p_kind='deliveries' then update deliveries set status=p_target,updated_at=now() where id=p_id;
  else update transfers set status=p_target where id=p_id; end if;
end $$;
