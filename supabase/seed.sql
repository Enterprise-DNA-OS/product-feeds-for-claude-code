insert into feed.shops(id,code,name,country,currency,owner) values
 ('10000000-0000-0000-0000-000000000001','KORU','Koru Outdoors Demo','NZ','NZD','Alex'),
 ('10000000-0000-0000-0000-000000000002','TASMAN','Tasman Gear Demo','AU','AUD','Morgan') on conflict do nothing;
insert into feed.channels(id,shop_id,name,format,owner) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Koru Shopping','google-tsv','Alex'),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','Tasman Catalogue','custom-csv','Morgan') on conflict do nothing;
insert into feed.products(id,shop_id,sku,title,description,price,currency,availability,quantity,link,image_link,brand,mpn,observed_at,product_type) values
 ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','PACK-20','Trail pack 20L','A compact day pack.',89.00,'NZD','in_stock',12,'https://example.com/pack','https://example.com/pack.jpg','Koru','P20',now(),'Packs'),
 ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','BOTTLE-1','Steel bottle','Insulated drinking bottle.',35.00,'NZD','in_stock',0,'https://example.com/bottle','https://example.com/bottle.jpg','Koru','B1',now(),'Bottles'),
 ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','TENT-2','Two person tent','Compact shelter.',249.00,'NZD','out_of_stock',0,'https://example.com/tent','https://example.com/tent.jpg','Koru','T2',now(),'Tents'),
 ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','MAT-1','','Camping mat.',65.00,'NZD','in_stock',4,'https://example.com/mat','','Koru','M1',now(),'Mats'),
 ('30000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000002','PACK-20','Trail pack Australia','Regional product record.',79.00,'AUD','in_stock',8,'https://example.com/au/pack','https://example.com/au/pack.jpg','Tasman','P20',now()-interval '5 days','Packs') on conflict do nothing;
insert into feed.rules(id,channel_id,name,priority,field,operator,match_value,action,target_field,value) values
 ('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Hold sold-out products',10,'availability','equals','out_of_stock','exclude','',''),
 ('40000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Label packs for review',20,'product_type','equals','Packs','set','custom_label_0','packs') on conflict do nothing;
insert into feed.tasks(id,shop_id,title,owner,due) values
 ('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Confirm bottle stock against the store','Alex',current_date-2),
 ('50000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','Refresh the Australian source file','Morgan',current_date+1) on conflict do nothing;
