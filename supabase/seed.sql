-- Optional demo seed. Replace or remove before production.
insert into public.machines (external_id,name,machine_type,owner_name,operator_name,operator_phone,status,capacity_acres_day,fuel_pct,current_lat,current_lng)
values
('MACH-01','Baler Unit #14','Claas Markant · 50 HP','CHC Ubhawal Cooperative','Balkar Singh','+91 98720 11223','IDLE',22,88,30.235,75.83),
('MACH-02','Baler Unit #07','New Holland BC5070 · 60 HP','Dhuri Progressive Farmers FPO','Satnam Singh','+91 98150 44556','BALING',28,74,30.36,75.86),
('MACH-03','Baler Unit #22','John Deere 459 · 50 HP','Avtar Agro Implements','Preet Mohinder','+91 94172 99887','IDLE',20,92,30.274,76.04),
('MACH-04','Super Seeder Combo #09','Super Seeder','Sunam Block Panchayati CHC','Jaswant Singh','+91 98881 22334','IDLE',18,95,30.135,75.805)
on conflict (external_id) do nothing;

insert into public.buyers (name,pathway,price_per_tonne,moisture_ceiling)
select * from (values
('Punjab Agro-Fungi Ltd','Mushroom substrate',3850,16),
('Craste Eco-Packaging','Moulded fibre',3200,14.5),
('Takachar Mobile Pyrolysis','Biochar',2650,22),
('Malwa Dairy Cooperative','Treated fodder',2400,18),
('Verbio CBG India Plant','CBG feedstock',1850,20)) as v(name,pathway,price_per_tonne,moisture_ceiling)
where not exists (select 1 from public.buyers b where b.name=v.name);

