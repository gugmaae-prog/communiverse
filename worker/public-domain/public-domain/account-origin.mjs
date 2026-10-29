import {logout as browserLogout} from './retained/session-logout.mjs';
import {api as coreAPI} from './retained/read-feed-social-backend.js';
import {circlesAPI} from './retained/read-feed-social-circles.js';
import {catalogueDatabase} from './retained/curated-catalogue.mjs';
import retained from './retained/first-render-gateway.mjs';
import {accountAPI} from './accounts.mjs';
import {identityResponse} from './identity-response.mjs';
import {legalSupport} from './legal.mjs';
import {CLIENT_BASE,clean,technical} from './urls.mjs';
import {accountConfiguration,accountDestination,LEGACY_APP_BASE} from './account-config.mjs';
import {guardForm,FORM_ACTIONS,formEndpoint,withoutChallengeToken} from './form-security.mjs';
import {readRegistrationBody,observeRegistration} from './registration-notifications.mjs';
import {reportAPI} from './report.mjs';
import {homeFeed} from './home-feed.mjs';
import {clubDiscovery} from './discovery-policy.mjs';
import {programmeResponse} from './dubai-programme.mjs';
const read=method=>['GET','HEAD'].includes(method);
const authenticated=/^\/(?:me$|identity(?:\/|$)|account(?:\/|$)|workspace(?:\/|$)|hearts$|follows$|report$|circles(?:\/|$)|booking\/request$|session-requests$|comments$|events?$|feed$|artists$|item$|galleries$|community$|location$|prices$|onboarding$|members$|auth(?:\/|$)|content\/remove$)/;
function internalRequest(request){const u=new URL(request.url);u.pathname=u.pathname==='/account/'||u.pathname==='/account'?'/communiverse/sign-in/':u.pathname.startsWith('/account/')?'/communiverse/'+u.pathname.slice('/account/'.length):u.pathname.startsWith('/api/')?'/communiverse'+u.pathname:u.pathname;return new Request(u,request);}
export async function brandedAccountRoute(request,env,ctx){
 const u=new URL(request.url),config=accountConfiguration(env),publicPath=u.pathname.replace(/^\/communiverse(?=\/)/,''),page=/^\/account(?:\/|$)/.test(u.pathname),api=publicPath.startsWith('/api/')&&authenticated.test(publicPath.slice(4)),profileAPI=/^\/communiverse\/workspace\/(?:profile\/(?:api|public|connect|callback)(?:\/|$)|welcome\/api(?:\/|$))/.test(u.pathname),hasSession=/(?:^|;\s*)__Host-cv-(account|workspace|session)=/.test(request.headers.get('Cookie')||'');
 if(!page&&!(config.enabled&&(profileAPI||api&&(hasSession||!read(request.method)))))return null;
 if(!config.enabled){if(!read(request.method))return Response.json({error:'Branded sign-in is not available yet.'},{status:503,headers:{'Cache-Control':'no-store'}});const suffix=u.pathname.replace(/^\/account\/?/,'')||'sign-in/';return new Response(null,{status:302,headers:{Location:LEGACY_APP_BASE+suffix+u.search,'Cache-Control':'no-store'}});}
 if((!read(request.method)||request.headers.get('Upgrade'))&&request.headers.get('Origin')!==u.origin)return new Response('Request origin denied',{status:403});
 let route=internalRequest(request);const endpoint=formEndpoint(route);
 if(request.method==='POST'&&FORM_ACTIONS[endpoint]&&endpoint!=='report'){try{const b=await readRegistrationBody(request.clone()),blocked=await guardForm(route,env,b);if(blocked)return blocked;route=withoutChallengeToken(route,b);}catch(e){return Response.json({error:e.status?e.message:'Check your form details.'},{status:e.status||400});}}
 // In-process handlers and existing authenticated Cloudflare service bindings retain tenant authorization.
 const scoped={...env,EMAIL:env.EMAIL&&{send(message){const mapped={...message};for(const key of ['text','html'])if(typeof mapped[key]==='string')mapped[key]=mapped[key].replace(/https:\/\/espacios\.me\/communiverse\/[^\s<>"']*/g,value=>accountDestination(value,env));return env.EMAIL.send(mapped);}}};
 const core=new Set(['me','feed','artists','item','event','events','galleries','community','comments','hearts','follows','content/remove','auth/start','auth/finish','auth/logout']);const dispatch=r=>{const endpoint=formEndpoint(r),dataEnv={...scoped,COMMUNIVERSE_DB:catalogueDatabase(scoped.COMMUNIVERSE_DB)};return endpoint.startsWith('circles')?circlesAPI(r,dataEnv):core.has(endpoint)?coreAPI(r,dataEnv,ctx):retained.fetch(r,scoped,ctx);};const readPage=r=>dispatch(internalRequest(r));let response;
 if(['account/logout','auth/logout','workspace/logout'].includes(endpoint))response=await browserLogout(route,scoped,ctx);
 else if(endpoint==='report'&&request.method==='POST')response=await reportAPI(route,scoped);
 else if(/^account\/(?:login|register|credentials|recover|logout)$/.test(endpoint))response=await accountAPI(route,scoped);
 else if(read(request.method)&&endpoint==='feed'&&u.searchParams.get('surface')==='home')response=await homeFeed(route,readPage);
 else if(read(request.method)&&endpoint==='circles')response=await clubDiscovery(route,readPage);
 else if(read(request.method)&&['event','events'].includes(endpoint))response=await programmeResponse(route,readPage);
 else response=await dispatch(route);
 if(response.status===101)return response;
 if(['account/logout','auth/logout','workspace/logout'].includes(endpoint)&&response.ok)for(const name of ['__Host-cv-oauth','__Host-cv-onboard','__Host-cv-auth-flow','__Host-cv-profile-link'])response.headers.append('Set-Cookie',name+'=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0');
 if(response.status===201&&endpoint==='account/register')ctx.waitUntil(observeRegistration(route,response.clone(),scoped,ctx).catch(()=>console.error('Communiverse account notification pending')));
 response=legalSupport(await identityResponse(response,route),route);const h=new Headers(response.headers);h.set('Cache-Control','private, no-store');h.set('X-Robots-Tag','noindex, nofollow');if(h.has('Location'))h.set('Location',accountDestination(h.get('Location'),env));return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});
}
function values(v,env){return typeof v==='string'?accountDestination(v,env):Array.isArray(v)?v.map(x=>values(x,env)):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,values(x,env)])):v;}
export async function accountSupport(response,request,env){
 if(response.status===101)return response;const u=new URL(request.url);if(!['communiverseclubs.com','preview.communiverseclubs.com','www.communiverseclubs.com'].includes(u.hostname)&&!(['espacios.me','www.espacios.me'].includes(u.hostname)&&u.pathname.startsWith('/communiverse/')))return response;
 const config=accountConfiguration(env),type=response.headers.get('Content-Type')||'',h=new Headers(response.headers);if(h.has('Location'))h.set('Location',accountDestination(h.get('Location'),env));if(/json|javascript|html/.test(type))for(const k of ['content-length','content-encoding','etag','last-modified'])h.delete(k);
 if(request.method==='HEAD')return new Response(null,{status:response.status,headers:h});
 if(type.includes('application/json'))return new Response(JSON.stringify(values(await response.json(),env)),{status:response.status,headers:h});
 if(type.includes('javascript')&&u.pathname.includes('/_domain/')){let text=await response.text();if(config.enabled)text=text.replaceAll(LEGACY_APP_BASE,'https://communiverseclubs.com/communiverse/').replaceAll('wss://espacios.me','wss://communiverseclubs.com').replaceAll('wss://www.espacios.me','wss://communiverseclubs.com').replace('old+prefix+p+u.search+u.hash',JSON.stringify(config.base)+"+p.replace(/^\\//,'')+u.search+u.hash");return new Response(text,{status:response.status,headers:h});}
 if(!type.includes('text/html'))return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});
 return new HTMLRewriter().on('head',{element(e){e.prepend('<script type="application/json" id="cv-account-config">'+JSON.stringify({base:config.base,enabled:config.enabled,publicOrigin:'https://communiverseclubs.com'}).replaceAll('<','\\u003c')+'</script><script defer src="'+CLIENT_BASE+'account-client.js"></script>',{html:true});}})
 .on('a[href],form[action]',{element(e){const key=e.tagName==='form'?'action':'href';e.setAttribute(key,accountDestination(e.getAttribute(key),env));}})
 .on('script[src]',{element(e){const src=e.getAttribute('src')||'';if(config.enabled&&src.startsWith('/communiverse/')&&technical(src)&&/\.js(?:[?#]|$)/.test(src)&&!src.includes('/_domain/'))e.setAttribute('src',CLIENT_BASE+clean(src).slice(1));}})
 .on('#cv-runtime-config',{element(e){e.setInnerContent(JSON.stringify({publicOrigin:u.origin,pageBase:'/',apiBase:'/communiverse/api/',assetBase:'/communiverse/_',accountBase:config.base,accountOrigin:new URL(config.base).origin}).replaceAll('<','\\u003c'),{html:true});}}).transform(new Response(response.body,{status:response.status,headers:h}));
}
