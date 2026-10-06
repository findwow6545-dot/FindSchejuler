import {database,sameOrigin,sessionCookie,sessionToken,fail} from '@/db/storage';
import {verifyPassword,newToken,tokenHash} from '@/db/password';
export async function POST(r:Request){try{
 if(!sameOrigin(r)||r.headers.get('sec-fetch-site')==='cross-site')return new Response(null,{status:403});
 if(Number(r.headers.get('content-length')||0)>4096)return new Response(null,{status:413});
 const x=await r.json() as any;
 if(typeof x.email!=='string'||x.email.length>200||typeof x.password!=='string'||x.password.length>128)return Response.json({error:'이메일과 비밀번호를 확인해 주세요.'},{status:400});
 const email=x.email.trim().toLowerCase(),db=database(),now=Date.now();
 const keys=[['email:'+tokenHash(email),8],['ip:'+tokenHash(r.headers.get('cf-connecting-ip')||'shared'),100]] as const;
 for(const [key,max] of keys){const row=await db.prepare('INSERT INTO login_attempts (key,count,reset_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<=? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END RETURNING count').bind(key,now+900000,now,now).first<{count:number}>();if(row&&row.count>max)return Response.json({error:'로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.'},{status:429,headers:{'Retry-After':'900','Cache-Control':'no-store'}})}
 const matches=await db.prepare('SELECT id,password_hash,auth_version FROM staff WHERE lower(trim(email))=? AND deleted_at IS NULL LIMIT 2').bind(email).all<any>();const member=matches.results.length===1?matches.results[0]:null;
 if(!verifyPassword(x.password,member?.password_hash||''))return Response.json({error:'이메일 또는 비밀번호가 올바르지 않습니다. 비밀번호 미설정 시 관리자에게 문의해 주세요.'},{status:401,headers:{'Cache-Control':'no-store'}});
 const token=newToken();const saved=await db.prepare('INSERT INTO member_sessions (token_hash,member_id,auth_version,expires_at) SELECT ?,id,auth_version,? FROM staff WHERE id=? AND auth_version=? AND password_hash=? AND lower(trim(email))=? AND deleted_at IS NULL').bind(tokenHash(token),now+604800000,member.id,member.auth_version,member.password_hash,email).run();
 if(!saved.meta.changes)return Response.json({error:'로그인 정보가 변경되었습니다. 다시 로그인해 주세요.'},{status:401});
 const old=sessionToken(r);if(old)await db.prepare('DELETE FROM member_sessions WHERE token_hash=?').bind(tokenHash(old)).run();
 await db.batch([db.prepare('DELETE FROM member_sessions WHERE expires_at<=?').bind(now),db.prepare('DELETE FROM login_attempts WHERE reset_at<=?').bind(now)]);
 return Response.json({signedIn:true},{headers:{'Set-Cookie':sessionCookie(r,token,604800),'Cache-Control':'no-store'}});
}catch(e){return fail(e)}}
export async function DELETE(r:Request){try{if(!sameOrigin(r)||r.headers.get('sec-fetch-site')==='cross-site')return new Response(null,{status:403});const token=sessionToken(r);if(token)await database().prepare('DELETE FROM member_sessions WHERE token_hash=?').bind(tokenHash(token)).run();return Response.json({signedOut:true},{headers:{'Set-Cookie':sessionCookie(r,'',0),'Cache-Control':'no-store'}})}catch(e){return fail(e)}}
