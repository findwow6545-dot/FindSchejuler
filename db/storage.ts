import {env} from 'cloudflare:workers';
import {tokenHash} from './password';
export function database(){if(!env.DB)throw Error('일정 저장소에 연결할 수 없습니다.');return env.DB}
export function bucket(){if(!env.BUCKET)throw Error('문서 저장소에 연결할 수 없습니다.');return env.BUCKET}
function platformIdentity(r:Request){return r.headers.get('oai-authenticated-user-id')&&r.headers.get('oai-authenticated-user-email')}
export async function identity(r:Request){return isOwner(r)?platformIdentity(r):(await registeredMember(r))?.email||null}
export function sameOrigin(r:Request){const o=r.headers.get('origin');return !o||o===new URL(r.url).origin}
export function fail(error:unknown){console.error(error);return Response.json({error:'저장소에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'},{status:503})}

// Membership is checked on every request so removal revokes editing immediately.
export function isOwner(r:Request){const email=platformIdentity(r)?.toLowerCase();return !!env.OWNER_EMAIL&&email===env.OWNER_EMAIL.trim().toLowerCase()||(import.meta.env.DEV&&email==='seedy@sites.test')}

export function sessionCookieName(r:Request){return import.meta.env.DEV&&new URL(r.url).protocol==='http:'?'dept_session':'__Host-dept_session'}
export function sessionToken(r:Request){const values=(r.headers.get('cookie')||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith(sessionCookieName(r)+'='));const token=values.length===1?values[0].split('=')[1]:'';return /^[a-f0-9]{64}$/.test(token)?token:null}
export function sessionCookie(r:Request,token:string,maxAge:number){return `${sessionCookieName(r)}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${sessionCookieName(r).startsWith('__Host-')?'; Secure':''}`}
export async function registeredMember(r:Request){const token=sessionToken(r);if(!token)return null;return database().prepare('SELECT staff.id,staff.name,staff.email,staff.is_admin FROM member_sessions s JOIN staff ON staff.id=s.member_id WHERE s.token_hash=? AND s.expires_at>? AND s.auth_version=staff.auth_version AND staff.deleted_at IS NULL AND staff.password_hash<>?').bind(tokenHash(token),Date.now(),'').first<{id:string;name:string;email:string;is_admin:number}>()}
export async function canEdit(r:Request){return isOwner(r)||!!(await registeredMember(r))}

export async function canManage(r:Request){return isOwner(r)||(await registeredMember(r))?.is_admin===1}
