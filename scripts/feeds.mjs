import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
export const FIELDS=['sku','title','description','price','currency','availability','link','image_link','brand','gtin','mpn','identifier_exists','condition','item_group_id','color','size','product_type','custom_label_0','quantity'];
const EDITABLE=FIELDS.filter(k=>k!=='sku');
const RULE_FIELDS=FIELDS.filter(k=>!['price','quantity','identifier_exists'].includes(k));
const SET_FIELDS=['title','description','brand','mpn','color','size','product_type','custom_label_0'];
const DATASETS=['shops','products','channels','rules','tasks','runs','approvals','imports','activity'];
export const READS={
 shops:'select code,name,country,currency,owner,stale_hours from feed.shops order by code',
 channels:'select c.id,s.code shop,c.name,c.format,c.owner from feed.channels c join feed.shops s on s.id=c.shop_id order by s.code,c.name',
 products:'select p.id,s.code shop,p.sku,p.title,p.price,p.currency,p.availability,p.archived from feed.products p join feed.shops s on s.id=p.shop_id order by s.code,p.sku',
 rules:'select r.id,c.name channel,r.name,r.priority,r.field,r.operator,r.match_value,r.action,r.target_field,r.value,r.enabled from feed.rules r join feed.channels c on c.id=r.channel_id order by c.name,r.priority',
 'stock-watch':'select * from feed.stock_watch order by shop,sku',
 'stale-inputs':'select * from feed.source_health where stale_products>0 or products=0 order by shop',
 tasks:'select * from feed.open_tasks order by due,shop,title',
 runs:'select * from feed.release_register order by created_at,id',
 history:'select actor,action,record_id,before_data,after_data,created_at from feed.activity order by created_at,id'
};
const OPTIONS={
 product:['shop'], 'feed-check':['channel'],compliance:['channel'],'exclusion-review':['channel'],'run-change':['run'],
 'add-shop':['code','name','country','owner','stale-hours'], 'add-channel':['shop','name','format','owner'],
 'add-product':['shop',...FIELDS,'observed-at'], 'update-product':['shop','product',...EDITABLE,'observed-at','archived','reason'],
 'add-rule':['channel','name','priority','field','operator','match','action','target','value'], 'disable-rule':['rule','reason'],
 'add-task':['shop','title','owner','due'],'close-task':['task','resolution'],log:['note'],
 import:['file','shop','map','observed-at','dry-run'],compile:['channel'],approve:['run','note'],'export-feed':['run','out'],export:['out'], 'draft-review':[]
};
export const COMMANDS=[...Object.keys(READS),'product','feed-check','compliance','exclusion-review','run-change','attention','weekly-review',...Object.keys(OPTIONS).filter(c=>!['product','feed-check','compliance','exclusion-review','run-change'].includes(c)),'help'];
const canonical=v=>v instanceof Date?v.toISOString():Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const hash=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(canonical(v))).digest('hex');
const required=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`--${k} is required`);return o[k].trim();};
function bool(v){if(!['true','false'].includes(String(v)))throw Error('Boolean must be true or false');return String(v)==='true';}
function integer(v){if(!/^\d+$/.test(String(v))||!Number.isSafeInteger(Number(v)))throw Error('Expected non-negative integer');return Number(v);}
function amount(v){if(v==='')return null;if(!/^-?\d{1,12}(\.\d{1,2})?$/.test(String(v)))throw Error('Price must be an ungrouped decimal with at most two decimals');return Number(v).toFixed(2);}
function timestamp(v){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(String(v))||!Number.isFinite(Date.parse(v)))throw Error('observed-at requires an ISO UTC timestamp');const d=new Date(v);if(d.toISOString().slice(0,19)!==v.slice(0,19)||d.getTime()>Date.now()+60000)throw Error('observed-at must be a real date, not in the future');return d.toISOString();}
function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error('due must be a valid calendar date');return v;}
function args(argv){const pos=[],o={};for(const x of argv){if(x.startsWith('--')){const i=x.indexOf('='),k=x.slice(2,i<0?undefined:i);if(k in o)throw Error(`Duplicate option --${k}`);o[k]=i<0?true:x.slice(i+1);}else pos.push(x);}const c=pos.shift()||'help';if(!COMMANDS.includes(c))throw Error(`Unknown command ${c}. Run help.`);for(const k of Object.keys(o))if(!['json','actor',...(OPTIONS[c]||[])].includes(k))throw Error(`Unknown option --${k}`);for(const k of ['json','dry-run'])if(k in o&&o[k]!==true)throw Error(`--${k} is a flag without a value`);if(pos.length>(['product','import'].includes(c)?1:0))throw Error('Unexpected positional arguments');return {c,pos,o};}
async function resolve(db,table,value,label='name',shop=null){if(!value)throw Error(`Choose a ${table} record`);const rows=await db.query(`select * from feed.${table} ${shop?'where shop_id=$1':''} order by id`,shop?[shop]:[]);const v=value.toLowerCase();const exact=rows.filter(r=>r.id===value||String(r[label]).toLowerCase()===v);const matches=exact.length?exact:rows.filter(r=>r.id.startsWith(v)||String(r[label]).toLowerCase().includes(v));if(matches.length!==1)throw Error(`${matches.length?'Ambiguous':'Unknown'} ${table}: ${value}. Candidates: ${(matches.length?matches:rows).map(r=>`${r.id} ${r[label]}`).join('; ')||'none'}`);return matches[0];}
async function audit(db,actor,action,id,before,after){await db.query('insert into feed.activity(actor,action,record_id,before_data,after_data) values($1,$2,$3,$4,$5)',[actor,action,id,JSON.stringify(before??null),JSON.stringify(after??null)]);}
async function insert(db,table,values){const ks=Object.keys(values);return (await db.query(`insert into feed.${table}(${ks.join(',')}) values(${ks.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(values)))[0];}
async function update(db,table,id,values){const ks=Object.keys(values);return (await db.query(`update feed.${table} set ${ks.map((k,i)=>`${k}=$${i+2}`).join(',')} where id=$1 returning *`,[id,...Object.values(values)]))[0];}
async function transaction(db,fn,preview=false){await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ');try{const r=await fn();await db.exec(preview?'ROLLBACK':'COMMIT');return r;}catch(e){await db.exec('ROLLBACK');throw e;}}
function url(v){try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)&&!!u.hostname&&!u.username&&!u.password;}catch{return false;}}
function validGtin(s){if(!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(s))return false;const ds=[...s].map(Number),check=ds.pop();return (10-ds.reverse().reduce((n,d,i)=>n+d*(i%2===0?3:1),0)%10)%10===check;}
function findings(p,shop){const out=[];const add=(rule,message,severity='error')=>out.push({sku:p.sku,rule,severity,message});
 if(!p.title.trim()||p.title.length>150)add('TITLE','Title is missing or exceeds 150 characters');
 if(!p.description.trim()||p.description.length>5000)add('DESCRIPTION','Description is missing or exceeds 5000 characters');
 if(!p.sku.trim()||p.sku.length>50)add('ID','Identifier is missing or exceeds 50 characters');
 if(!url(p.link))add('LINK','Product link must be an absolute HTTP or HTTPS address');
 if(!url(p.image_link))add('IMAGE','Image link must be an absolute HTTP or HTTPS address');
 if(p.price===null||Number(p.price)<=0)add('PRICE','This feed requires a positive product price');
 if(p.currency!==shop.currency)add('CURRENCY','Product currency differs from the shop currency');
 if(!['in_stock','out_of_stock','preorder','backorder'].includes(p.availability))add('AVAILABILITY','Availability is not a supported value');
 if(['preorder','backorder'].includes(p.availability))add('AVAILABILITY_DATE','Preorder and backorder require a date field beyond this base export');
 if(!['new','used','refurbished'].includes(p.condition))add('CONDITION','Condition must be new, used or refurbished');
 if(p.quantity===0&&p.availability==='in_stock')add('STOCK_CONFLICT','Zero quantity contradicts in-stock availability');
 if(p.gtin&&!validGtin(p.gtin))add('GTIN','GTIN length or check digit is invalid');
 if(p.identifier_exists&&!p.gtin&&!(p.brand&&p.mpn))add('IDENTIFIERS','Check the manufacturer identifiers: GTIN, or brand and MPN where applicable');
 if(!p.identifier_exists&&(p.gtin||p.mpn))add('IDENTIFIER_CONFLICT','Identifier exemption conflicts with a supplied identifier');
 if(new Date(p.observed_at).getTime()<Date.now()-shop.stale_hours*3600000)add('FRESHNESS','Source observation is older than the shop freshness policy');
 if(/apparel|clothing|shoes/i.test(p.product_type))add('APPAREL_REVIEW','Apparel can need age group, gender and variant fields beyond this base export');
 for(const f of FIELDS)if(typeof p[f]==='string'&&/[\t\r\n]/.test(p[f]))add('DELIMITERS',`${f} contains a tab or line break; normalise before export`);
 return out;
}
const OUTPUT_FIELDS=['id','title','description','link','image_link','availability','price','brand','gtin','mpn','identifier_exists','condition','item_group_id','color','size','product_type','custom_label_0'];
function output(p){return Object.fromEntries(OUTPUT_FIELDS.map(k=>[k,k==='id'?p.sku:k==='price'?`${Number(p.price).toFixed(2)} ${p.currency}`:k==='identifier_exists'?(p[k]?'yes':'no'):p[k]??'']));}
export async function evaluate(db,value){const channel=await resolve(db,'channels',value);const shop=(await db.query('select * from feed.shops where id=$1',[channel.shop_id]))[0];const products=await db.query('select * from feed.products where shop_id=$1 and not archived order by sku',[shop.id]);const rules=await db.query('select * from feed.rules where channel_id=$1 and enabled order by priority,id',[channel.id]);
 const fingerprint=hash({channel,shop,products,rules});const items=[];
 for(const raw of products){const p={...raw},trace=[];let excluded=false;for(const r of rules){const val=String(p[r.field]??'');const hit=r.operator==='equals'?val===r.match_value:r.operator==='contains'?val.toLowerCase().includes(r.match_value.toLowerCase()):val.trim()==='';if(!hit)continue;trace.push(r.name);if(r.action==='exclude'){excluded=true;break;}p[r.target_field]=r.value;}
 const checks=excluded?[]:findings(p,shop);items.push({sku:p.sku,excluded,rules:trace,findings:checks,output:excluded?null:output(p)});}
 const errors=items.flatMap(x=>x.findings).filter(x=>x.severity==='error').length;const counts={source:items.length,included:items.filter(x=>!x.excluded).length,excluded:items.filter(x=>x.excluded).length,errors};
 return {channel,shop,fingerprint,counts,items};
}
function cleanProduct(o,defaults={}){const p={...defaults};for(const k of FIELDS)if(k in o){const v=o[k];p[k]=k==='price'?amount(v):k==='quantity'?(v===''?null:integer(v)):k==='identifier_exists'?bool(v):String(v).trim();}return p;}
function atomicFile(file,text){const dest=path.resolve(file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,text,{flag:'wx',mode:0o600});return dest;}
async function readRun(db,id){return resolve(db,'runs',id,'id');}
export function pretty(value){if(Array.isArray(value)){if(!value.length)return '  (none)';return table(value,Object.keys(value[0]).map(key=>({key,label:key.replaceAll('_',' '),format:v=>v instanceof Date?v.toISOString():v&&typeof v==='object'?JSON.stringify(v):v})));}return Object.entries(value).map(([k,v])=>`${k}\n${v&&typeof v==='object'?pretty(v):v}`).join('\n\n');}
export async function run(db,argv){const {c,pos,o}=args(argv);if(c==='help')return {commands:COMMANDS,usage:'npm run feeds -- COMMAND --name=value --json. See docs/cli.md. Writes require --actor.'};if(READS[c])return db.query(READS[c]);
 if(c==='product'){const shop=o.shop?(await resolve(db,'shops',o.shop,'code')).id:null;return [await resolve(db,'products',pos[0],'sku',shop)];}
 if(['feed-check','compliance','exclusion-review'].includes(c)){const e=await evaluate(db,required(o,'channel'));if(c==='exclusion-review')return e.items.filter(x=>x.excluded).map(x=>({sku:x.sku,reason:x.rules.join('; ')}));return e.items.flatMap(x=>x.findings).map(x=>({channel:e.channel.name,...x}));}
 if(c==='attention')return {overdue_tasks:await db.query('select * from feed.open_tasks where overdue order by due'),stale_shops:await db.query('select * from feed.source_health where stale_products>0 or products=0 order by shop'),stock_conflicts:await db.query("select * from feed.stock_watch where reason='Stock contradicts availability' order by shop,sku")};
 if(c==='weekly-review')return {sources:await run(db,['stale-inputs']),stock:await run(db,['stock-watch']),tasks:await run(db,['tasks']),releases:await run(db,['runs'])};
 if(c==='run-change'){const r=await readRun(db,required(o,'run'));const earlier=await db.query('select r.* from feed.runs r join feed.approvals a on a.run_id=r.id where r.channel_id=$1 and r.id<>$2 and r.created_at<=$3 order by r.created_at desc,r.id desc limit 1',[r.channel_id,r.id,r.created_at]);const before=new Map((earlier[0]?.snapshot.items||[]).filter(x=>!x.excluded).map(x=>[x.sku,x.output]));const after=new Map(r.snapshot.items.filter(x=>!x.excluded).map(x=>[x.sku,x.output]));const diff=[];for(const [sku,v] of after)if(!before.has(sku)||hash(before.get(sku))!==hash(v))diff.push({sku,change:before.has(sku)?'changed':'added',before:before.get(sku)||null,after:v});for(const [sku,v] of before)if(!after.has(sku))diff.push({sku,change:'removed',before:v,after:null});return diff;}
 if(c==='export'){const data={format:'product-feeds-snapshot-v1',exported_at:new Date().toISOString(),data:{}};await db.exec('BEGIN READ ONLY');try{for(const t of DATASETS)data.data[t]=await db.query(`select * from feed.${t} order by id`);}finally{await db.exec('ROLLBACK');}const file=atomicFile(required(o,'out'),JSON.stringify(data,null,2)+'\n');return {file,counts:Object.fromEntries(DATASETS.map(k=>[k,data.data[k].length]))};}
 if(c==='draft-review'){const review=await run(db,['weekly-review']);const file=atomicFile(path.join(REPO_ROOT,'drafts',`feed-review-${randomUUID()}.md`),'# Product feed review\n\nFictional only if the demo database is selected. Check the source before sharing.\n\n'+pretty(review)+'\n\nPrepared locally. Nothing has been sent or published.\n');return {file};}
 const actor=required(o,'actor');
 if(c==='export-feed')return transaction(db,async()=>{const r=await readRun(db,required(o,'run'));if(!(await db.query('select id from feed.approvals where run_id=$1',[r.id])).length)throw Error('Run needs approval');const e=await evaluate(db,r.channel_id);if(e.fingerprint!==r.fingerprint||e.counts.errors)throw Error('Run is stale or has errors. Compile and review again.');const rows=r.snapshot.items.filter(x=>!x.excluded).map(x=>x.output);if(!rows.length)throw Error('Refusing an empty feed');const delim=e.channel.format==='google-tsv'?'\t':',';const csv=v=>'"'+String(v).replace(/"/g,'""')+'"';const text=[OUTPUT_FIELDS,...rows.map(p=>OUTPUT_FIELDS.map(k=>p[k]))].map(row=>row.map(v=>delim===','?csv(v):v).join(delim)).join('\n')+'\n';const file=atomicFile(required(o,'out'),text);try{await audit(db,actor,c,r.id,null,{file,sha256:hash(text),rows:rows.length});}catch(err){fs.rmSync(file,{force:true});throw err;}return {file,rows:rows.length,sha256:hash(text),delivery:'Local file only'};});
 return transaction(db,async()=>{
 let r,before=null;
 if(c==='add-shop'){const country=required(o,'country');r=await insert(db,'shops',{code:required(o,'code'),name:required(o,'name'),country,currency:country==='NZ'?'NZD':'AUD',owner:required(o,'owner'),stale_hours:integer(o['stale-hours']||48)});}
 else if(c==='add-channel'){const s=await resolve(db,'shops',required(o,'shop'),'code');r=await insert(db,'channels',{shop_id:s.id,name:required(o,'name'),owner:required(o,'owner'),format:o.format||'google-tsv'});}
 else if(c==='add-product'){const s=await resolve(db,'shops',required(o,'shop'),'code');r=await insert(db,'products',{shop_id:s.id,...cleanProduct(o,{currency:s.currency}),sku:required(o,'sku'),observed_at:timestamp(required(o,'observed-at'))});}
 else if(c==='update-product'){const s=await resolve(db,'shops',required(o,'shop'),'code');before=await resolve(db,'products',required(o,'product'),'sku',s.id);required(o,'reason');const values=cleanProduct(o);if('observed-at'in o)values.observed_at=timestamp(o['observed-at']);if('archived'in o)values.archived=bool(o.archived);if(!Object.keys(values).length)throw Error('No product fields supplied');r=await update(db,'products',before.id,values);}
 else if(c==='add-rule'){const channel=await resolve(db,'channels',required(o,'channel'));const field=required(o,'field'),action=required(o,'action'),operator=required(o,'operator');if(!RULE_FIELDS.includes(field))throw Error('Unsupported condition field');if(action==='set'&&!SET_FIELDS.includes(o.target))throw Error('Unsupported target field; prices and stock cannot be changed by a rule');if(operator!=='missing'&&!('match'in o))throw Error('--match is required');if(action==='set'&&!('value'in o))throw Error('--value is required');r=await insert(db,'rules',{channel_id:channel.id,name:required(o,'name'),priority:integer(required(o,'priority')),field,operator,match_value:o.match||'',action,target_field:o.target||'',value:o.value||''});}
 else if(c==='disable-rule'){before=await resolve(db,'rules',required(o,'rule'));required(o,'reason');r=await update(db,'rules',before.id,{enabled:false});}
 else if(c==='add-task'){const s=await resolve(db,'shops',required(o,'shop'),'code');r=await insert(db,'tasks',{shop_id:s.id,title:required(o,'title'),owner:required(o,'owner'),due:date(required(o,'due'))});}
 else if(c==='close-task'){before=await resolve(db,'tasks',required(o,'task'),'title');if(before.status==='closed')throw Error('Task already closed');r=await update(db,'tasks',before.id,{status:'closed',resolution:required(o,'resolution')});}
 else if(c==='log'){r={note:required(o,'note')};}
 else if(c==='compile'){const e=await evaluate(db,required(o,'channel'));r=await insert(db,'runs',{channel_id:e.channel.id,fingerprint:e.fingerprint,snapshot:JSON.stringify(e),counts:JSON.stringify(e.counts),actor});}
 else if(c==='approve'){const rr=await readRun(db,required(o,'run'));const e=await evaluate(db,rr.channel_id);if(e.fingerprint!==rr.fingerprint)throw Error('Run is stale. Compile again.');if(e.counts.errors||!e.counts.included)throw Error('Cannot approve: feed has errors or is empty');r=await insert(db,'approvals',{run_id:rr.id,actor,note:required(o,'note')});}
 else if(c==='import'){
 if(pos[0]!=='datafeedwatch')throw Error('Use import datafeedwatch');const shop=await resolve(db,'shops',required(o,'shop'),'code'),observed=timestamp(required(o,'observed-at'));const file=required(o,'file'),text=fs.readFileSync(file,'utf8'),rows=parseCsv(text);if(!rows.length)throw Error('CSV is empty');const mapping=o.map?JSON.parse(fs.readFileSync(o.map,'utf8')):{};if(!mapping||Array.isArray(mapping)||typeof mapping!=='object')throw Error('Mapping must be an object');for(const [k,v]of Object.entries(mapping))if(!FIELDS.includes(k)||typeof v!=='string')throw Error('Invalid mapping');const headers=Object.keys(rows[0]);const read=(row,k)=>{const candidates=mapping[k]?[mapping[k]]:k==='sku'?['sku','id']:k==='image_link'?['image_link','image']:k==='link'?['link','url']:[k];const found=headers.find(h=>candidates.some(x=>x.toLowerCase()===h.toLowerCase()));if(mapping[k]&&!found)throw Error(`Mapped column missing: ${mapping[k]}`);return found===undefined?undefined:row[found];};const counts={added:0,updated:0,unchanged:0};const seen=new Set();
 for(const row of rows){const fields={};for(const k of FIELDS){const v=read(row,k);if(v!==undefined)fields[k]=v;}if(!String(fields.sku||'').trim())throw Error('CSV needs sku or id; use --map for different headings');if(seen.has(fields.sku.trim()))throw Error('Duplicate SKU in import');seen.add(fields.sku.trim());if(fields.price&&/^\d+(?:\.\d{1,2})? (NZD|AUD)$/.test(fields.price)){const [a,cc]=fields.price.split(' ');if(fields.currency&&fields.currency!==cc)throw Error('Price currency conflicts with currency column');fields.price=a;fields.currency=cc;}if('identifier_exists'in fields){const v=String(fields.identifier_exists).toLowerCase();if(!['yes','no','true','false'].includes(v))throw Error('identifier_exists requires yes/no or true/false');fields.identifier_exists=['yes','true'].includes(v)?'true':'false';}const data=cleanProduct(fields,{currency:shop.currency});const prev=(await db.query('select * from feed.products where shop_id=$1 and sku=$2',[shop.id,data.sku]))[0];if(prev&&Date.parse(observed)<new Date(prev.observed_at).getTime())throw Error(`Older source observation for ${data.sku}`);const values={...data,observed_at:observed,source_payload:JSON.stringify(row)};let current;if(!prev){current=await insert(db,'products',{shop_id:shop.id,...values});counts.added++;}else{const changed=Object.entries(data).some(([k,v])=>String(prev[k]??'')!==String(v??''))||new Date(prev.observed_at).toISOString()!==observed||hash(prev.source_payload)!==hash(row);if(!changed){counts.unchanged++;continue;}current=await update(db,'products',prev.id,values);counts.updated++;}await audit(db,actor,'import-product',current.id,prev,current);}
 r=await insert(db,'imports',{shop_id:shop.id,filename:path.basename(file),sha256:hash(text),observed_at:observed,counts:JSON.stringify(counts),actor});await audit(db,actor,c,r.id,null,r);return {...counts,dry_run:!!o['dry-run'],batch:r.id};
 }else throw Error(`Not implemented: ${c}`);
 await audit(db,actor,c,r.id||null,before,{...r,...(o.reason?{reason:o.reason}:{})});return r;
 },!!o['dry-run']);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const result=await run(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(result,null,2):pretty(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
