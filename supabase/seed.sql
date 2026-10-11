-- Demo-only seed. Do not run against production.
-- Public reference records below are sourced from the Punjab Pollution Control Board
-- status report filed with the National Green Tribunal (seasonal paddy-straw collection
-- targets for October-November 2024). These are historical targets, NOT current buyer
-- demand, contracted volumes, live prices, or verified current operating status.
-- Source: https://www.greentribunal.gov.in/sites/default/files/news_updates/Status%20Report%20by%20State%20of%20Punjab%20in%20OA%20No.%20632%20of%202023%20%28In%20Re%20News%20item%20published%20in%20The%20Hindu%20dated%2006.10.2023%20titled%20Pollution%20takes%20a%20front%20seat%20as%20Stubble%20Fires%20Spike%20in%20Punjab.pdf

-- Synthetic machines for demo/testing only. No real operator names or phone numbers.
insert into public.machines
  (external_id,name,machine_type,owner_name,operator_name,operator_phone,status,capacity_acres_day,fuel_pct,current_lat,current_lng)
values
  ('DEMO-MACH-01','Demo Baler Unit 01','Round baler · simulated','Demo CHC Sangrur',null,null,'IDLE',22,88,30.235,75.830),
  ('DEMO-MACH-02','Demo Baler Unit 02','Square baler · simulated','Demo CHC Dhuri',null,null,'IDLE',28,74,30.360,75.860),
  ('DEMO-MACH-03','Demo Baler Unit 03','Round baler · simulated','Demo CHC Patiala',null,null,'IDLE',20,92,30.274,76.040),
  ('DEMO-MACH-04','Demo Super Seeder 01','Super seeder · simulated','Demo CHC Sunam',null,null,'IDLE',18,95,30.135,75.805)
on conflict (external_id) do nothing;

-- Publicly reported CBG project operators/facilities. Disabled until a real buyer
-- relationship and current procurement terms are independently verified.
insert into public.buyers (name,pathway,price_per_tonne,moisture_ceiling,active)
select v.name, v.pathway, null, null, false
from (values
  ('Verbio India Private Limited','CBG feedstock; public historical reference only'),
  ('Farm Gas Private Limited','CBG feedstock; public historical reference only'),
  ('Sangrur RNG Private Limited','CBG feedstock; public historical reference only'),
  ('Patiala RNG Private Limited','CBG feedstock; public historical reference only')
) as v(name,pathway)
where not exists (select 1 from public.buyers b where b.name=v.name);

-- Four historical demand fixtures from the same report. Expired on purpose so they
-- cannot be mistaken for live procurement. Figures are reported collection targets,
-- not actual deliveries: 50,000 t (Verbio), 40,000 t each (Farm Gas, Sangrur RNG,
-- Patiala RNG), with a season deadline of 30 November 2024.
insert into public.buyer_demands
  (buyer_id,buyer_name,residue_type,target_tonnes,pickup_deadline,radius_km,max_moisture_pct,status)
select b.id,
       b.name || ' — 2024 historical target (expired demo fixture)',
       'PADDY_STRAW',
       v.target_tonnes,
       date '2024-11-30',
       50,
       null,
       'EXPIRED'
from (values
  ('Verbio India Private Limited',50000::numeric),
  ('Farm Gas Private Limited',40000::numeric),
  ('Sangrur RNG Private Limited',40000::numeric),
  ('Patiala RNG Private Limited',40000::numeric)
) as v(name,target_tonnes)
join public.buyers b on b.name=v.name
where not exists (
  select 1 from public.buyer_demands d
  where d.buyer_id=b.id
    and d.pickup_deadline=date '2024-11-30'
    and d.status='EXPIRED'
    and d.buyer_name=b.name || ' — 2024 historical target (expired demo fixture)'
);
