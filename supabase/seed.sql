-- Run after schema.sql in the Supabase SQL editor. Safe to repeat for named demo records.
insert into warehouses(name,short_code,address) values
  ('Main Warehouse','MAIN','Ponda, Goa'),('North Warehouse','NORTH','North zone')
on conflict(short_code) do nothing;

insert into categories(name,description) values
  ('Furniture','Desks, tables and seating'),('Electronics','Devices and peripherals'),('Office Supplies','Everyday supplies')
on conflict(name) do nothing;

insert into locations(warehouse_id,name,short_code)
select w.id,x.name,x.code from (values
  ('MAIN','Main Stock','MAIN-ST'),('MAIN','Receiving Area','RECV'),('MAIN','Shelf A1','A1'),
  ('MAIN','Shelf A2','A2'),('MAIN','Dispatch Area','DISP'),('NORTH','Main Stock','MAIN-ST')) x(warehouse,name,code)
join warehouses w on w.short_code=x.warehouse
on conflict(warehouse_id,short_code) do nothing;

insert into products(name,sku,category_id,unit,unit_cost,sales_price,reorder_level,description)
select x.name,x.sku,c.id,'units',x.cost,x.price,x.reorder,x.description
from (values
  ('Office Desk','FUR-DESK-01','Furniture',8500,11200,8,'Solid office desk'),
  ('Office Chair','FUR-CHAIR-01','Furniture',3200,4500,12,'Adjustable office chair'),
  ('Meeting Table','FUR-TABLE-01','Furniture',14000,18500,4,'Conference meeting table'),
  ('Laptop','ELE-LAP-01','Electronics',42000,52000,6,'Business laptop'),
  ('Monitor','ELE-MON-01','Electronics',9500,12500,8,'24 inch display'),
  ('Keyboard','ELE-KEY-01','Electronics',850,1300,15,'USB keyboard'),
  ('Mouse','ELE-MOU-01','Electronics',450,750,15,'Wireless mouse'),
  ('Printer','ELE-PRI-01','Electronics',12500,16900,5,'Office laser printer')) x(name,sku,category,cost,price,reorder,description)
join categories c on c.name=x.category
on conflict(sku) do nothing;

insert into inventory(product_id,warehouse_id,location_id,quantity_on_hand)
select p.id,w.id,l.id,x.qty from (values
  ('FUR-DESK-01','MAIN',18),('FUR-CHAIR-01','MAIN',9),('FUR-TABLE-01','MAIN',3),
  ('ELE-LAP-01','MAIN',13),('ELE-MON-01','MAIN',7),('ELE-KEY-01','MAIN',34),
  ('ELE-MOU-01','MAIN',29),('ELE-PRI-01','MAIN',0),('FUR-CHAIR-01','NORTH',5)) x(sku,warehouse,qty)
join products p on p.sku=x.sku join warehouses w on w.short_code=x.warehouse
join locations l on l.warehouse_id=w.id and l.short_code='MAIN-ST'
on conflict(product_id,location_id) do nothing;

-- Opening balances appear as confirmed adjustments and movement history.
insert into adjustments(reference,warehouse_id,location_id,product_id,system_quantity,counted_quantity,difference,reason,notes,status)
select 'OPEN-'||p.sku||'-'||w.short_code,w.id,l.id,p.id,0,i.quantity_on_hand,i.quantity_on_hand,
  'Physical Count','Demo opening balance','done'
from inventory i join products p on p.id=i.product_id join warehouses w on w.id=i.warehouse_id
join locations l on l.id=i.location_id
on conflict(reference) do nothing;

insert into stock_movements(reference,product_id,movement_type,destination_warehouse_id,destination_location_id,quantity,related_document_id)
select a.reference,a.product_id,'adjustment',a.warehouse_id,a.location_id,a.counted_quantity,a.id
from adjustments a where a.reference like 'OPEN-%'
and not exists(select 1 from stock_movements m where m.related_document_id=a.id);

insert into receipts(reference,vendor_name,warehouse_id,location_id,scheduled_date,source_document,status)
select x.ref,x.vendor,w.id,l.id,current_date+x.days,x.doc,x.status from (values
  ('REC-DEMO-001','Goa Office Supply','MAIN',0,'PO-2026-041','ready'),
  ('REC-DEMO-002','Tech Source','NORTH',3,'PO-2026-042','waiting'),
  ('REC-DEMO-003','Furniture Direct','MAIN',5,'PO-2026-043','draft')) x(ref,vendor,warehouse,days,doc,status)
join warehouses w on w.short_code=x.warehouse join locations l on l.warehouse_id=w.id and l.short_code='MAIN-ST'
on conflict(reference) do nothing;

insert into receipt_items(receipt_id,product_id,expected_quantity,received_quantity)
select r.id,p.id,10,10 from receipts r join products p on p.sku='FUR-CHAIR-01' where r.reference='REC-DEMO-001'
on conflict(receipt_id,product_id) do nothing;

insert into deliveries(reference,customer_name,warehouse_id,location_id,scheduled_date,source_document,status)
select x.ref,x.customer,w.id,l.id,current_date+x.days,x.doc,x.status from (values
  ('DEL-DEMO-001','Nova Systems','MAIN',1,'SO-2026-101','waiting'),
  ('DEL-DEMO-002','Coastal Workspace','MAIN',4,'SO-2026-102','draft')) x(ref,customer,warehouse,days,doc,status)
join warehouses w on w.short_code=x.warehouse join locations l on l.warehouse_id=w.id and l.short_code='MAIN-ST'
on conflict(reference) do nothing;

insert into delivery_items(delivery_id,product_id,requested_quantity,delivered_quantity)
select d.id,p.id,2,2 from deliveries d join products p on p.sku='ELE-LAP-01' where d.reference='DEL-DEMO-001'
on conflict(delivery_id,product_id) do nothing;

insert into transfers(reference,source_warehouse_id,source_location_id,destination_warehouse_id,destination_location_id,scheduled_date,status,notes)
select 'TRF-DEMO-001',a.id,la.id,b.id,lb.id,current_date+2,'draft','North zone replenishment'
from warehouses a join locations la on la.warehouse_id=a.id and la.short_code='MAIN-ST'
join warehouses b on b.short_code='NORTH' join locations lb on lb.warehouse_id=b.id and lb.short_code='MAIN-ST'
where a.short_code='MAIN' on conflict(reference) do nothing;

insert into transfer_items(transfer_id,product_id,quantity)
select t.id,p.id,3 from transfers t join products p on p.sku='ELE-MON-01' where t.reference='TRF-DEMO-001'
on conflict(transfer_id,product_id) do nothing;
