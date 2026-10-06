import {database,identity,canManage,sameOrigin,fail} from '@/db/storage';
const batch='scheduler-test-2026-v1';
// Sample creation is retired for the live scheduler.
export async function POST(){return Response.json({error:'실제 운영 일정실에서는 테스트 일정을 생성하지 않습니다.'},{status:410})}
export async function DELETE(r:Request){const who=await identity(r);if(!(await canManage(r))||!who||!sameOrigin(r))return Response.json({error:'로그인이 필요합니다.'},{status:403});try{const now=new Date().toISOString();const r=await database().prepare('UPDATE events SET deleted_at=?,updated=?,editor=?,version=version+1 WHERE test_batch=? AND deleted_at IS NULL').bind(now,now,who,batch).run();return Response.json({deleted:r.meta.changes})}catch(e){return fail(e)}}

