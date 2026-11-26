-- Weekly numbers. Run in the Supabase SQL editor every Monday and keep the rows in one sheet.
-- Senders are counted by anon_id (a random id in their browser). Recipients carry no id, so their rows are plain counts.
-- The order follows the app: start, sign in, plan with the guide, write, hand over (pay), the recipient opens.
with e as (
  select *, date_trunc('week', created_at)::date as week
  from public.events
  where created_at > now() - interval '12 weeks'
),
s as (  -- senders: distinct visitors who reached each step that week
  select week,
    count(distinct anon_id) filter (where name = 'page_view')                                   as visited,
    count(distinct anon_id) filter (where name = 'cta_start')                                   as clicked_start,
    count(distinct anon_id) filter (where name = 'interview_done')                              as basics_done,
    count(distinct anon_id) filter (where name = 'sign_in_done')                                as signed_in,
    count(distinct anon_id) filter (where name = 'plan_ready')                                  as plan_ready,
    count(distinct anon_id) filter (where name = 'chat_parsed')                                 as brought_chat,
    count(distinct anon_id) filter (where name = 'letters_written' and props->>'step' = '1')     as wrote_1,
    count(distinct anon_id) filter (where name = 'letters_written' and props->>'step' = '3')     as wrote_3,
    count(distinct anon_id) filter (where name = 'letters_written' and props->>'step' = '5')     as wrote_5,
    count(distinct anon_id) filter (where name = 'checkout_start')                              as checkout,
    count(distinct anon_id) filter (where name = 'payment_completed' and props->>'kind' = 'paid') as paid,
    count(distinct anon_id) filter (where name = 'link_made')                                   as link_made
  from e where anon_id is not null
  group by week
),
r as (  -- recipients: plain counts (no ids)
  select week,
    count(*) filter (where name = 'box_opened') as box_opens,
    count(*) filter (where name = 'reply_sent') as replies,
    count(*) filter (where name = 'make_back')  as make_back_clicks,
    count(*) filter (where name = 'refunded')   as refunds
  from e group by week
)
select s.*,
  round(100.0 * s.paid / nullif(s.visited, 0), 2)    as paid_pct_of_visits,
  round(100.0 * s.wrote_3 / nullif(s.plan_ready, 0), 1) as wrote3_pct_of_plans,
  coalesce(r.box_opens, 0) as box_opens, coalesce(r.replies, 0) as replies,
  coalesce(r.make_back_clicks, 0) as make_back_clicks, coalesce(r.refunds, 0) as refunds
from s left join r using (week)
order by week desc;

-- Senders who came from a recipient's box ("Write letters for ..."), and how many of them paid.
-- The payment row carries no source, so it is matched to the visit by anon_id.
with came as (
  select anon_id, min(created_at) as first_at from public.events
  where src = 'box' and medium = 'make_back' and anon_id is not null and created_at > now() - interval '12 weeks'
  group by anon_id
)
select date_trunc('week', c.first_at)::date as week,
  count(*) as came_from_box,
  count(*) filter (where exists (select 1 from public.events p where p.anon_id = c.anon_id and p.name = 'payment_completed')) as paid
from came c group by 1 order by 1 desc;

-- The gates in the marketing plan, over the last 30 days: 30+ paid without ads, 3%+ of visits pay, average order $15+.
select
  count(distinct anon_id) filter (where name = 'payment_completed' and props->>'kind' = 'paid') as paid_30d,
  round(100.0 * count(distinct anon_id) filter (where name = 'payment_completed' and props->>'kind' = 'paid')
        / nullif(count(distinct anon_id) filter (where name = 'page_view'), 0), 2)            as paid_pct_30d,
  round(avg((props->>'amount')::numeric / 100) filter (where name = 'payment_completed' and props->>'kind' = 'paid'), 2) as avg_order_usd_30d
from public.events
where anon_id is not null and created_at > now() - interval '30 days';
