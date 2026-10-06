import {database,identity,canEdit,sameOrigin,fail} from '@/db/storage';
export async function POST(r:Request){
 const who=await identity(r);if(!(await canEdit(r))||!who||!sameOrigin(r))return Response.json({error:'로그인이 필요합니다.'},{status:403});
 try{
  const x=await r.json() as any;
  if(typeof x.id!=='string'||!Number.isInteger(x.version)||typeof x.month!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(x.month)||(x.beforeId!==null&&typeof x.beforeId!=='string'))return Response.json({error:'이동할 행사와 월을 확인해 주세요.'},{status:400});
  const db=database(),event=await db.prepare('SELECT * FROM events WHERE id=? AND deleted_at IS NULL').bind(x.id).first<any>();
  if(!event||event.version!==x.version)return Response.json({error:'다른 사용자가 행사를 수정했습니다. 최신 일정을 불러온 뒤 다시 옮겨 주세요.'},{status:409});
  if(x.beforeId===x.id)return Response.json({event});
  const all=await db.prepare("SELECT id,version,CASE WHEN sort_order=0 THEN CAST(strftime('%s',start) AS REAL) ELSE sort_order END AS position FROM events WHERE deleted_at IS NULL AND substr(start,1,7)=? AND id<>? ORDER BY position,start,id").bind(x.month,x.id).all<any>();
  const rows=all.results,at=x.beforeId===null?rows.length:rows.findIndex(e=>e.id===x.beforeId);
  if(at<0)return Response.json({error:'대상 행사가 이동되었습니다. 다시 시도해 주세요.'},{status:409});
  let start=event.start,end=event.end;
  if(event.start.slice(0,7)!==x.month){const [year,month]=x.month.split('-').map(Number);const day=Math.min(Number(event.start.slice(8,10)),new Date(Date.UTC(year,month,0)).getUTCDate());start=x.month+'-'+String(day).padStart(2,'0');end=new Date(Date.parse(start)+Date.parse(event.end)-Date.parse(event.start)).toISOString().slice(0,10)}
  rows.splice(at,0,{id:event.id,version:event.version});
  const order=rows.map((e,i)=>({id:e.id,version:e.version,position:Date.parse(x.month+'-01')/1000+(i+1)*86400}));
  // One guarded statement makes reordering atomic even for equal-date cards.
  const result=await db.prepare(`WITH desired AS (SELECT json_extract(value,'$.id') AS id,json_extract(value,'$.version') AS expected_version,json_extract(value,'$.position') AS position FROM json_each(?))
   UPDATE events SET sort_order=(SELECT position FROM desired WHERE desired.id=events.id),start=CASE WHEN id=? THEN ? ELSE start END,end=CASE WHEN id=? THEN ? ELSE end END,updated=?,editor=?,version=version+1
   WHERE id IN (SELECT id FROM desired) AND (SELECT count(*) FROM desired JOIN events AS current ON current.id=desired.id WHERE current.version=desired.expected_version AND current.deleted_at IS NULL)=?`).bind(JSON.stringify(order),x.id,start,x.id,end,new Date().toISOString(),who,order.length).run();
  if(result.meta.changes!==order.length)return Response.json({error:'이동 중 일정이 변경되었습니다. 새로 불러온 뒤 다시 시도해 주세요.'},{status:409});
  return Response.json({event:await db.prepare('SELECT * FROM events WHERE id=?').bind(x.id).first()});
 }catch(e){return fail(e)}
}
