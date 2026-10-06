import {database,canManage,canEdit,sameOrigin,fail} from '@/db/storage';
import {hashPassword} from '@/db/password';
export async function GET(r:Request){try{if(!await canEdit(r))return Response.json({error:'로그인이 필요합니다.'},{status:401});const fields=await canManage(r)?"id,name,role,email,version,updated,is_admin,CASE WHEN password_hash<>'' THEN 1 ELSE 0 END AS password_set":"id,name,role";return Response.json({staff:(await database().prepare(`SELECT ${fields} FROM staff WHERE deleted_at IS NULL ORDER BY role,name`).all()).results},{headers:{'Cache-Control':'no-store'}})}catch(e){return fail(e)}}
export async function POST(r:Request){try{
 if(!await canManage(r)||!sameOrigin(r))return Response.json({error:'관리자만 구성원을 변경할 수 있습니다.'},{status:403});
 const x=await r.json() as any,email=typeof x.email==='string'?x.email.trim().toLowerCase():'';
 if(typeof x.name!=='string'||!x.name.trim()||x.name.length>60||!['교수','조교'].includes(x.role)||email.length>200||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof x.password!=='string'||(x.password&&(x.password.length<6||x.password.length>128))||typeof x.is_admin!=='boolean')return Response.json({error:'이름·이메일·권한을 확인하고 비밀번호는 6~128자로 입력해 주세요.'},{status:400});
 const db=database(),id=x.id||crypto.randomUUID(),now=new Date().toISOString();
 const existing=x.id?await db.prepare('SELECT * FROM staff WHERE id=? AND deleted_at IS NULL').bind(id).first<any>():null;
 if(x.id&&(!existing||existing.version!==x.version))return Response.json({error:'구성원 정보가 변경되었습니다. 다시 선택해 주세요.'},{status:409});
 if(!x.password&&!existing?.password_hash)return Response.json({error:'로그인에 사용할 비밀번호를 설정해 주세요.'},{status:400});
 const duplicate=await db.prepare('SELECT id FROM staff WHERE lower(trim(email))=? AND id<>? AND deleted_at IS NULL LIMIT 1').bind(email,id).first();
 if(duplicate)return Response.json({error:'이미 다른 구성원에게 등록된 이메일입니다.'},{status:409});
 const password=x.password?hashPassword(x.password):existing.password_hash;
 const changed=existing&&(email!==existing.email||password!==existing.password_hash||Number(x.is_admin)!==existing.is_admin);
 if(existing){const result=await db.prepare('UPDATE staff SET name=?,role=?,email=?,login_email=?,password_hash=?,is_admin=?,auth_version=auth_version+?,updated=?,version=version+1 WHERE id=? AND version=? AND deleted_at IS NULL').bind(x.name.trim(),x.role,email,email,password,Number(x.is_admin),changed?1:0,now,id,x.version).run();if(!result.meta.changes)return Response.json({error:'구성원 정보가 변경되었습니다. 다시 선택해 주세요.'},{status:409})}
 else await db.prepare('INSERT INTO staff (id,name,role,email,login_email,password_hash,is_admin,updated,version) VALUES (?,?,?,?,?,?,?,?,1)').bind(id,x.name.trim(),x.role,email,email,password,Number(x.is_admin),now).run();
 return Response.json({saved:true,sessionsRevoked:!!changed});
}catch(e){return fail(e)}}
export async function DELETE(r:Request){try{if(!await canManage(r)||!sameOrigin(r))return Response.json({error:'관리자만 구성원을 삭제할 수 있습니다.'},{status:403});const x=await r.json() as any;if(typeof x.id!=='string'||!Number.isInteger(x.version))return Response.json({error:'구성원을 다시 선택해 주세요.'},{status:400});const now=new Date().toISOString();const result=await database().prepare('UPDATE staff SET deleted_at=?,login_email=NULL,auth_version=auth_version+1,updated=?,version=version+1 WHERE id=? AND version=? AND deleted_at IS NULL').bind(now,now,x.id,x.version).run();if(!result.meta.changes)return Response.json({error:'구성원 정보가 변경되었습니다. 새로 확인해 주세요.'},{status:409});return Response.json({deleted:true})}catch(e){return fail(e)}}
