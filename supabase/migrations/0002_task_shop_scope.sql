create or replace view feed.open_tasks as
 select t.id,s.code shop,t.title,t.owner,t.due,(t.due<current_date) overdue,t.shop_id
 from feed.tasks t join feed.shops s on s.id=t.shop_id where t.status='open';
