import stable from './stable/entry.mjs';
import {publicExperience} from './entry.mjs';
import {CLIENT_BASE,accountPath,clean,read} from './urls.mjs';
import {accountFailure,accountPageRequest,accountAPIRequest} from './account-availability.mjs';
export {RegistrationDelivery} from './registration-delivery.mjs';
const publicHosts=new Set(['communiverseclubs.com','www.communiverseclubs.com','preview.communiverseclubs.com']);
export function isPublicExperience(request){
 const u=new URL(request.url),p=clean(u.pathname);
 if(!publicHosts.has(u.hostname)||!read(request.method)||request.headers.get('Upgrade')||accountPath(p))return false;
 if(u.pathname.startsWith(CLIENT_BASE))return true;
 if(p==='/api/feed'&&u.searchParams.get('surface')==='home')return true;
 return p==='/'||/^\/(?:discover|works|artists|artist|circles|plug|people|ambassadors|privacy|terms)(?:\/|$)/.test(p);
}
export default {async fetch(request,env,ctx){
 if(isPublicExperience(request))return publicExperience.fetch(request,env,ctx);
 try{
  const response=await stable.fetch(request,env,ctx);
  if(accountPageRequest(request)&&response.status>=500)return accountFailure(request);
  return response;
 }catch(error){
  if(accountPageRequest(request)||accountAPIRequest(request)){
   console.error('Communiverse account unavailable',/daily row read limit|daily row write limit/.test(String(error.message))?'daily-service-limit':error.name);
   return accountFailure(request,error);
  }
  throw error;
 }
},async scheduled(controller,env,ctx){if(stable.scheduled)return stable.scheduled(controller,env,ctx);}};
