/* Communiverse corrected experience release — production-safe, 2026-10-09.
 *
 * This is an additive HTML-only presentation layer. It MUST NOT replace the
 * original marketplace Worker or return staging's simulated workspace data.
 * All authenticated APIs and mutations stay with the original Worker.
 */
import CLIENT from './client.txt';
import CSS from './style.txt';
import KNOWLEDGE from './knowledge.mjs';

const BASE='/communiverse/';
const JS=BASE+'__cvfix_v2.js';
const STYLE=BASE+'__cvfix_v2.css';
const KNOWLEDGE_ROUTE=BASE+'api/knowledge/artist-assignments';
const RELEASE='communiverse-experience-v2-20261009';
const HTML_ROUTES=new Set([BASE,BASE+'workspace/']);

function textAsset(request,content,type){
 const headers=new Headers({
  'Content-Type':type,
  'Cache-Control':'public, max-age=180',
  'X-Content-Type-Options':'nosniff',
  'X-Communiverse-Experience':RELEASE
 });
 return new Response(request.method==='HEAD'?null:content,{headers});
}
const err=(message,status)=>Response.json({error:message},{status,headers:{'Cache-Control':'no-store','X-Communiverse-Experience':RELEASE}});

async function original(request,env){
 if(!env.MARKETPLACE)return err('Communiverse is temporarily unavailable.',503);
 // Preserve request cookies, body, method, and host-sensitive application state.
 const url=new URL(request.url);
 url.protocol='https:';
 url.host='espacios.me';
 return env.MARKETPLACE.fetch(new Request(url,request));
}
class Head{
 element(element){element.append('<link rel="stylesheet" href="'+STYLE+'" data-cv-experience="v2-20261009">',{html:true})}
}
class Body{
 element(element){element.append('<script defer src="'+JS+'" data-cv-experience="v2-20261009"></script>',{html:true})}
}

export default {
 async fetch(request,env,ctx){
  const url=new URL(request.url),path=url.pathname;
  if(path===JS&&['GET','HEAD'].includes(request.method))return textAsset(request,CLIENT,'text/javascript; charset=utf-8');
  if(path===STYLE&&['GET','HEAD'].includes(request.method))return textAsset(request,CSS,'text/css; charset=utf-8');
  if(path===KNOWLEDGE_ROUTE)return KNOWLEDGE.fetch(request,env,ctx);
  // Stage/prod diagnostic contains no data about users, environment bindings or credentials.
  if(path===BASE+'__cvfix-release-health'&&request.method==='GET'){
   return Response.json({ok:true,release:RELEASE,mode:'html-presentation-only'}, {headers:{'Cache-Control':'no-store'}});
  }
  // Every other path (including non-HTML, POST, signup, OAuth and uploads) is pass-through.
  const upstream=await original(request,env);
  if(!HTML_ROUTES.has(path)||request.method!=='GET'||!upstream.ok)return upstream;
  if(!String(upstream.headers.get('Content-Type')||'').toLowerCase().includes('text/html'))return upstream;
  const headers=new Headers(upstream.headers);
  for(const name of ['content-length','content-encoding','etag','last-modified'])headers.delete(name);
  headers.set('X-Communiverse-Experience',RELEASE);
  const originalHTML=new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
  return new HTMLRewriter().on('head',new Head()).on('body',new Body()).transform(originalHTML);
 }
};
