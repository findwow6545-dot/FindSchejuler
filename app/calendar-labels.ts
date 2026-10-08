import holidays from './holidays-kr.json';

// Snapshot of published Korean calendars: https://github.com/hyunbinseo/holidays-kr
// Retrieved 2026-10-08; keep the upstream MIT license in vendor/.
export function holidayName(date:string):string {
 const year=date.slice(0,4);
 const data=(holidays as Record<string,Record<string,string[]>>)[year];
 return data?.[date]?.join(' · ')||'';
}
export function holidayYearAvailable(month:string){return month.slice(0,4) in holidays}
export function ownerName(owner?:string){return owner?.split(' · ')[0].trim()||'담당자 미정'}
export function ownerColor(owner?:string){
 const name=ownerName(owner);if(name==='담당자 미정')return '#68768b';
 let hash=0;for(const ch of name)hash=(hash*31+ch.charCodeAt(0))>>>0;
 return `hsl(${hash%360} 58% 38%)`;
}
