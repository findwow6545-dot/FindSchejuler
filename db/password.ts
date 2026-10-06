import {Buffer} from 'node:buffer';
import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
// scrypt parameters keep memory bounded while making offline guessing costly.
export function hashPassword(password:string){const salt=Buffer.from(randomBytes(16)).toString('hex');return `scrypt-v1$${salt}$${Buffer.from(scryptSync(password,salt,32,{N:16384,r:8,p:5,maxmem:32*1024*1024})).toString('hex')}`}
export function verifyPassword(password:string,stored:string){const [,salt,hash]=stored.split('$');const valid=/^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(stored);const actual=scryptSync(password,valid?salt:'00000000000000000000000000000000',32,{N:16384,r:8,p:5,maxmem:32*1024*1024});return timingSafeEqual(actual,Buffer.from(valid?hash:'0'.repeat(64),'hex'))&&valid}
export function tokenHash(token:string){return createHash('sha256').update(token).digest('hex')}
export function newToken(){return Buffer.from(randomBytes(32)).toString('hex')}
