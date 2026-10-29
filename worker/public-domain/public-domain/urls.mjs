import {platformCopy} from './brand-copy.mjs';
import {portraitText} from './portrait-refresh.mjs';
export const OLD='https://espacios.me';
export const ORIGIN='https://communiverseclubs.com';
export const PREVIEW='https://preview.communiverseclubs.com';
export const PREFIX='/communiverse';
export const RELEASE='public-domain-20261029-v26';
export const CLIENT_BASE=PREFIX+'/_domain/'+RELEASE+'/';
const accounts=/^\/(?:workspace|sign-in|signin|join|profile|onboarding|confirm|apply|host|auth|account)(?:\/|$)/;
export const read=m=>m==='GET'||m==='HEAD';
export function clean(p){return p===PREFIX?'/':p.startsWith(PREFIX+'/')?p.slice(PREFIX.length):p;}
export function accountPath(p){return accounts.test(clean(p))||/^\/events\/host(?:\/|$)/.test(clean(p));}
export function technical(p){return /^\/(?:api(?:\/|$)|_|auth(?:\/|$))/.test(clean(p));}
export function legacyPublicRedirect(request,mode){
 if(!['temporary','permanent'].includes(mode))return null;
 const u=new URL(request.url);
 const existingSession=/(?:^|;\s*)__Host-cv-(?:account|session|workspace)=/.test(request.headers.get('Cookie')||'');
 if(existingSession||u.searchParams.get('cv_account')==='1'||!['espacios.me','www.espacios.me'].includes(u.hostname)||!read(request.method)||request.headers.get('Upgrade')||!(u.pathname===PREFIX||u.pathname.startsWith(PREFIX+'/'))||technical(u.pathname)||accountPath(u.pathname))return null;
 return {location:ORIGIN+clean(u.pathname)+u.search,status:mode==='permanent'?301:302};
}
export function internal(p){return p.startsWith(PREFIX+'/')?p:PREFIX+(p==='/'?'/':p);}
export function link(value,origin=ORIGIN){
 if(typeof value!=='string'||!value.startsWith('/')&&!/^https?:\/\//.test(value))return value;
 let u;try{u=new URL(value,origin);}catch{return value;}
 if(u.origin===OLD&&u.searchParams.get('cv_account')==='1')return value;
 if(![OLD,'https://www.espacios.me',ORIGIN,PREVIEW].includes(u.origin))return value;
 if(u.origin===OLD&&!u.pathname.startsWith(PREFIX+'/')&&u.pathname!==PREFIX)return value;
 if(accountPath(u.pathname))return OLD+internal(clean(u.pathname))+u.search+u.hash;
 if(technical(u.pathname))return internal(clean(u.pathname))+u.search+u.hash;
 if(clean(u.pathname).replace(/\/$/,'')==='/artists'){u.pathname='/circles/';u.searchParams.set('filter','artists');if(u.searchParams.has('artist')){u.searchParams.set('person',u.searchParams.get('artist'));u.searchParams.delete('artist');}return value.startsWith('http')?origin+u.pathname+u.search+u.hash:u.pathname+u.search+u.hash;}
 u.pathname=clean(u.pathname);if(u.pathname.replace(/\/$/,'')==='/discover')u.pathname='/';return value.startsWith('http')?origin+u.pathname+u.search+u.hash:u.pathname+u.search+u.hash;
}
export function rewrite(source,origin){
 // Only new, separately versioned client URLs use this transformation.
 // The original versioned assets and their contents are retained unchanged.
 return platformCopy(portraitText(source)).replace("if(!r.ok)throw Object.assign(Error(d.error||'Please try again.'),{status:r.status});return d;","if(!r.ok)throw Object.assign(Error(d.error||'Please try again.'),{status:r.status});window.CVDiscovery?.response(path,d);return d;").replace("delete window.__cvFirstData[path];return data","delete window.__cvFirstData[path];window.CVDiscovery?.response(path,data);return data").replace(/\bCool Kids\b/gi,'People').replace("const gallery=new URL(location.href).searchParams.get('gallery');if(gallery)q.set('gallery',gallery);","if(location.pathname==='/')q.set('surface','home');const gallery=new URL(location.href).searchParams.get('gallery');if(gallery)q.set('gallery',gallery);")
 .replace('function masonry(){', 'function masonry(){window.CVSyncFeedPromotions?.();')
 .replace("const label=input.closest('label');if(!label)return;","const label=input.closest('label');if(!label)return;label.classList.add('cv4-search-field');")
 .replace(/https:\/\/(?:www\.)?espacios\.me\/communiverse(?=[/"'?#\s<]|$)/g,'/communiverse')
 .replace(/\/communiverse\/(workspace|sign-in|signin|join|profile|onboarding|confirm|apply|host|auth|account)(?=\/|["'?#\s<]|$)/g,(_,part)=>'__CV_ACCOUNT__'+part)
 .replace(/\/communiverse\/(?!api(?:\/|["'])|_)/g,'/')
 .replace(/(["'])\/communiverse\1/g,(_,q)=>q+'/'+q)
 .replaceAll('__CV_ACCOUNT__',OLD+PREFIX+'/')
 .replace(/(["'])\/communiverse\/([^"'?\s]+\.js)(?=[?'"])/g,(_,q,file)=>q+CLIENT_BASE+file)
 .replaceAll('\\/communiverse\\/','\\/');
}
export function canonical(value){const u=new URL(value);u.pathname=clean(u.pathname);u.hash='';for(const key of [...u.searchParams.keys()])if(!['id','artwork','work','person'].includes(key))u.searchParams.delete(key);u.searchParams.sort();return u.href;}
