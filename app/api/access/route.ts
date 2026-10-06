import {canEdit,canManage,isOwner,registeredMember,fail} from '@/db/storage';
export async function GET(r:Request){try{const member=await registeredMember(r);return Response.json({canEdit:await canEdit(r),canManageMembers:await canManage(r),signedIn:isOwner(r)||!!member,memberName:member?.name||'',memberSession:!!member},{headers:{'Cache-Control':'no-store'}})}catch(e){return fail(e)}}
