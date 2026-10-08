// Shared, contrasting colors. Existing assignments are stored on staff records.
export const memberColors=['#239bd0','#86602b','#e57516','#83b52b','#8554c7','#d63b59','#3566ca','#168451','#c13b99','#497c86','#a24c30','#6256a5'];
export function nextMemberColor(rows:{color?:string}[]){const count=(c:string)=>rows.filter(r=>r.color===c).length;return [...memberColors].sort((a,b)=>count(a)-count(b))[0]}

