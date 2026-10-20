-- JSONB aggregate: satu snapshot bisnis per pemilik, transaksi atomik dan CAS revision.
-- Tidak ada seed prospek, transaksi, atau klaim aset yang dipulihkan.
create or replace function public.valid_hq_date(v text, optional boolean default false)
returns boolean language plpgsql immutable set search_path = '' as $$
begin
 if optional and v = '' then return true; end if;
 if v is null or v !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
 return v::date between date '2000-01-01' and date '2200-12-31' and to_char(v::date,'YYYY-MM-DD') = v;
exception when others then return false;
end $$;

create or replace function public.valid_hq_state(s jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare k text; r jsonb; n numeric; max_count int;
begin
 if s is null or jsonb_typeof(s) <> 'object' or not s ?& array['version','leads','entries','decisions','assets','tasks','road','start']
 or (select count(*) from jsonb_object_keys(s)) <> 8 or s->'version' <> '2'::jsonb
 or jsonb_typeof(s->'start') <> 'string' or not public.valid_hq_date(s->>'start',true) then return false; end if;
 foreach k in array array['leads','entries','decisions','assets','tasks','road'] loop
  if jsonb_typeof(s->k) <> 'array' then return false; end if;
  max_count := case k when 'leads' then 2000 when 'entries' then 5000 when 'decisions' then 2000 when 'assets' then 1000 when 'tasks' then 3 else 8 end;
  if jsonb_array_length(s->k)>max_count then return false; end if;
  if k in ('tasks','road') then
   if (select count(*) <> count(distinct value) from jsonb_array_elements(s->k)) then return false; end if;
   for r in select value from jsonb_array_elements(s->k) loop
    if jsonb_typeof(r) <> 'number' then return false; end if;
    n := r::text::numeric;
    if n<>trunc(n) or n<0 or n>(case k when 'tasks' then 2 else 7 end) then return false; end if;
   end loop;
  else
   if (select count(*) <> count(distinct value->>'id') from jsonb_array_elements(s->k)) then return false; end if;
   for r in select value from jsonb_array_elements(s->k) loop
    if jsonb_typeof(r)<>'object' or jsonb_typeof(r->'id')<>'string' or length(r->>'id') not between 1 and 100 or r->>'id' !~ '^[a-zA-Z0-9_-]+$' then return false; end if;
    if k='leads' then
     if not r ?& array['id','name','problem','stage','value','next','date'] or (select count(*) from jsonb_object_keys(r))<>7
      or jsonb_typeof(r->'name')<>'string' or length(btrim(r->>'name')) not between 1 and 500
      or jsonb_typeof(r->'problem')<>'string' or length(btrim(r->>'problem')) not between 1 and 500
      or jsonb_typeof(r->'stage')<>'string' or r->>'stage' not in ('Baru','Dihubungi','Discovery','Qualified','Proposal','Won','Lost','Nurture')
      or jsonb_typeof(r->'next')<>'string' or length(r->>'next')>500 or jsonb_typeof(r->'date')<>'string' or not public.valid_hq_date(r->>'date',true) then return false; end if;
    else
     if jsonb_typeof(r->'title')<>'string' or length(btrim(r->>'title')) not between 1 and 500 then return false; end if;
     if k='entries' then
      if not r ?& array['id','title','type','value','date'] or (select count(*) from jsonb_object_keys(r))<>5 or r->>'type' not in ('Omzet','Kas masuk','Biaya') or jsonb_typeof(r->'type')<>'string' or jsonb_typeof(r->'date')<>'string' or not public.valid_hq_date(r->>'date') then return false; end if;
     elsif k='decisions' then
      if not r ?& array['id','title','status','source'] or (select count(*) from jsonb_object_keys(r))<>4 or r->>'status' not in ('FINAL','USULAN','EKSPERIMEN','BELUM TERVERIFIKASI') or jsonb_typeof(r->'status')<>'string' or jsonb_typeof(r->'source')<>'string' or length(btrim(r->>'source')) not between 1 and 500 then return false; end if;
     else
      if not r ?& array['id','title','status','location','notes'] or (select count(*) from jsonb_object_keys(r))<>5 or r->>'status' not in ('TERSEDIA','USULAN','BELUM TERVERIFIKASI') or jsonb_typeof(r->'status')<>'string' or jsonb_typeof(r->'location')<>'string' or length(r->>'location')>500 or jsonb_typeof(r->'notes')<>'string' or length(r->>'notes')>2000 then return false; end if;
     end if;
    end if;
    if k in ('leads','entries') then
     if jsonb_typeof(r->'value')<>'number' then return false; end if;
     n := (r->>'value')::numeric;
     if n<>trunc(n) or n<0 or n>1000000000000 or (k='entries' and n=0) then return false; end if;
    end if;
   end loop;
  end if;
 end loop;
 return true;
exception when others then return false;
end $$;

create table public.workspaces (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null check (public.valid_hq_state(data) is true and octet_length(data::text)<=2000000),
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now()
);
alter table public.workspaces enable row level security;
alter table public.workspaces force row level security;
create policy owner_select on public.workspaces for select to authenticated using ((select auth.uid())=owner_id);
create policy owner_insert on public.workspaces for insert to authenticated with check ((select auth.uid())=owner_id);
create policy owner_update on public.workspaces for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
revoke all on public.workspaces from anon, authenticated;
grant select, insert, update on public.workspaces to authenticated;

-- Trigger memaksa revision monotonik juga untuk klien Data API langsung.
create function public.hq_version() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='INSERT' then new.revision:=1;
 else
  if new.owner_id<>old.owner_id then raise exception 'OWNER_IMMUTABLE'; end if;
  new.revision:=old.revision+1;
 end if;
 new.updated_at:=now();return new;
end $$;
create trigger hq_version before insert or update on public.workspaces for each row execute function public.hq_version();

create function public.save_workspace(payload jsonb,expected_revision bigint)
returns bigint language plpgsql security invoker set search_path='' as $$
declare result bigint; uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 if expected_revision is null or expected_revision<0 or public.valid_hq_state(payload) is not true or octet_length(payload::text)>2000000 then raise exception 'INVALID_PAYLOAD'; end if;
 if expected_revision=0 then
  insert into public.workspaces(owner_id,data) values(uid,payload) on conflict(owner_id) do nothing returning revision into result;
 else
  update public.workspaces set data=payload where owner_id=uid and revision=expected_revision returning revision into result;
 end if;
 if result is null then raise exception 'REVISION_CONFLICT'; end if;
 return result;
end $$;
revoke all on function public.save_workspace(jsonb,bigint) from public,anon;
grant execute on function public.save_workspace(jsonb,bigint) to authenticated;
