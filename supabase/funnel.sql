-- Funnel report. Run in the Supabase SQL editor. Counts distinct visitors (anon_id) per stage.
-- Change the interval to look at a different window.
with e as (
  select * from public.events
  where anon_id is not null and created_at > now() - interval '30 days'
)
select stage, visitors,
       round(100.0 * visitors / nullif(first_value(visitors) over (order by ord), 0), 1) as pct_of_visits
from (
  select 1 as ord, 'visited site' as stage, count(distinct anon_id) as visitors from e where name = 'page_view'
  union all select 2, 'clicked start',    count(distinct anon_id) from e where name = 'cta_start'
  union all select 3, 'finished basics',  count(distinct anon_id) from e where name = 'interview_done'
  union all select 4, 'saw paywall',      count(distinct anon_id) from e where name = 'page_view' and path = '/paywall'
  union all select 5, 'went to checkout', count(distinct anon_id) from e where name = 'checkout_start'
  union all select 6, 'paid',             count(distinct anon_id) from e where name = 'payment_completed' and props->>'kind' = 'paid'
  union all select 7, 'finished AI plan', count(distinct anon_id) from e where name = 'plan_ready'
  union all select 8, 'dressed the box',  count(distinct anon_id) from e where name = 'box_dressed'
  union all select 9, 'made the link',    count(distinct anon_id) from e where name = 'link_made'
) s
order by ord;

-- Where paid customers come from (first touch).
select coalesce(nullif(src, ''), '(direct)') as source,
       count(distinct anon_id) filter (where name = 'page_view') as visitors,
       count(distinct anon_id) filter (where name = 'payment_completed') as paid
from public.events
where created_at > now() - interval '30 days' and anon_id is not null
group by 1
order by paid desc, visitors desc;

-- Refunds in the same window (they carry no anon_id).
select count(*) as refunds from public.events
where name = 'refunded' and created_at > now() - interval '30 days';
