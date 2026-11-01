create schema feed;
create function feed.touch() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table feed.shops (
 id uuid primary key default gen_random_uuid(), code text not null unique check(code<>''), name text not null check(name<>''),
 country text not null check(country in ('NZ','AU')), currency text not null check(currency in ('NZD','AUD')), owner text not null check(owner<>''),
 stale_hours integer not null default 48 check(stale_hours between 1 and 8760),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check((country='NZ' and currency='NZD') or (country='AU' and currency='AUD'))
);
create table feed.products (
 id uuid primary key default gen_random_uuid(), shop_id uuid not null references feed.shops, sku text not null check(sku<>''),
 title text not null default '', description text not null default '', price numeric(14,2), currency text not null check(currency in ('NZD','AUD')),
 availability text not null default '', link text not null default '', image_link text not null default '', brand text not null default '',
 gtin text not null default '', mpn text not null default '', identifier_exists boolean not null default true,
 condition text not null default 'new', item_group_id text not null default '', color text not null default '', size text not null default '',
 product_type text not null default '', custom_label_0 text not null default '', quantity integer check(quantity>=0),
 observed_at timestamptz not null, archived boolean not null default false, source_payload jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(shop_id,sku)
);
create table feed.channels (
 id uuid primary key default gen_random_uuid(), shop_id uuid not null references feed.shops, name text not null check(name<>''),
 format text not null default 'google-tsv' check(format in ('google-tsv','custom-csv')), owner text not null check(owner<>''),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(shop_id,name)
);
create table feed.rules (
 id uuid primary key default gen_random_uuid(), channel_id uuid not null references feed.channels, name text not null check(name<>''),
 priority integer not null check(priority>=0), field text not null, operator text not null check(operator in ('equals','contains','missing')),
 match_value text not null default '', action text not null check(action in ('set','exclude')), target_field text not null default '', value text not null default '',
 enabled boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(channel_id,priority)
);
create table feed.tasks (
 id uuid primary key default gen_random_uuid(), shop_id uuid not null references feed.shops, title text not null check(title<>''),
 owner text not null check(owner<>''), due date not null, status text not null default 'open' check(status in ('open','closed')),
 resolution text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status='open' or length(trim(resolution))>0)
);
create table feed.runs (
 id uuid primary key default gen_random_uuid(), channel_id uuid not null references feed.channels, fingerprint text not null,
 snapshot jsonb not null, counts jsonb not null, actor text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table feed.approvals (
 id uuid primary key default gen_random_uuid(), run_id uuid not null unique references feed.runs, actor text not null, note text not null check(note<>''),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table feed.imports (
 id uuid primary key default gen_random_uuid(), shop_id uuid not null references feed.shops, filename text not null, sha256 text not null,
 observed_at timestamptz not null, counts jsonb not null, actor text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table feed.activity (
 id uuid primary key default gen_random_uuid(), actor text not null, action text not null, record_id uuid, before_data jsonb, after_data jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function feed.immutable() returns trigger language plpgsql as $$ begin raise exception 'Evidence is immutable'; end $$;
do $$ declare t text; begin
 foreach t in array array['shops','products','channels','rules','tasks'] loop
 execute format('create trigger touch before update on feed.%I for each row execute function feed.touch()',t);
 end loop;
 foreach t in array array['runs','approvals','imports','activity'] loop
 execute format('create trigger immutable before update or delete on feed.%I for each row execute function feed.immutable()',t);
 end loop;
 foreach t in array array['shops','products','channels','rules','tasks','runs','approvals','imports','activity'] loop
 execute format('alter table feed.%I enable row level security',t);
 end loop;
end $$;
create view feed.source_health as
 select s.id shop_id,s.code shop,s.owner,s.stale_hours,count(p.id)::int products,
 count(p.id) filter(where p.observed_at < now()-s.stale_hours*interval '1 hour')::int stale_products,
 min(p.observed_at) oldest_observation
 from feed.shops s left join feed.products p on p.shop_id=s.id and not p.archived group by s.id;
create view feed.stock_watch as
 select s.code shop,p.sku,p.title,p.availability,p.quantity,p.observed_at,
 case when p.quantity=0 and p.availability='in_stock' then 'Stock contradicts availability'
 when p.availability='out_of_stock' then 'Out of stock' else 'Availability needs review' end reason
 from feed.products p join feed.shops s on s.id=p.shop_id where not p.archived and
 (p.availability='out_of_stock' or (p.quantity=0 and p.availability='in_stock') or p.availability not in ('in_stock','out_of_stock','preorder','backorder'));
create view feed.open_tasks as
 select t.id,s.code shop,t.title,t.owner,t.due,(t.due<current_date) overdue from feed.tasks t join feed.shops s on s.id=t.shop_id where t.status='open';
create view feed.release_register as
 select r.id,c.name channel,s.code shop,r.counts,r.actor prepared_by,r.created_at,a.actor reviewed_by,a.created_at reviewed_at
 from feed.runs r join feed.channels c on c.id=r.channel_id join feed.shops s on s.id=c.shop_id left join feed.approvals a on a.run_id=r.id;
revoke all on schema feed from public;
revoke all on all tables in schema feed from public;
