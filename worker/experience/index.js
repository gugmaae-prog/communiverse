/* Communiverse 2026-10-09 reversible presentation gateway.
 * Never mutate the existing communiverse-marketplace Worker or its bindings.
 * Routes are more specific than the existing communiverse* routes.
 */
import {taskCollection,artistAssignmentCollection,relatedWorks,envelope} from "../knowledge/knowledge-model.mjs";
const PREFIX="/communiverse/";
const JS=PREFIX+"_public/cv-experience-20261009.js";
const CSS=PREFIX+"_public/cv-experience-20261009.css";
const D1_SQL="SELECT a.artist_id,a.ambassador_id,s.name,s.profile_slug,p.photo_url,p.photo_version FROM cv_artist_assignments a JOIN cv_staff s ON s.id=a.ambassador_id AND s.status='active' LEFT JOIN cv_identity_profiles p ON p.identity_id=s.id";
const asURL=(req,path)=>{const u=new URL(req.url);u.protocol="https:";u.host="espacios.me";if(path)u.pathname=path;return new Request(u,req)};
const plain=(body,type)=>new Response(body,{headers:{"content-type":type,"cache-control":"public, max-age=31536000, immutable","x-content-type-options":"nosniff","access-control-allow-origin":"*"}});
const json=(body,status=200)=>Response.json(body,{status,headers:{"cache-control":"no-store","x-content-type-options":"nosniff"}});
const safeID=v=>typeof v==="string"&&/^[a-zA-Z0-9_-]{1,120}$/.test(v);
const compact=x=>typeof x==="string"?x.slice(0,350):"";
function requestToOrigin(request,path){return asURL(request,path)}
async function service(env,request,path){return env.COMMUNIVERSE_RUNTIME.fetch(requestToOrigin(request,path))}
async function assignments(env){
 const q=await env.COMMUNIVERSE_DB.prepare(D1_SQL).all();
 return (q.results||[]).map(x=>({artist_id:x.artist_id,ambassador_id:x.ambassador_id,name:x.name,
 profile_slug:x.profile_slug,photo_url:x.photo_url||"",photo_version:x.photo_version||1}));
}
const personByAssignment=r=>({id:r.ambassador_id,name:r.name,profile_slug:r.profile_slug,photo_url:r.photo_url,
 avatar:r.photo_url|| (safeID(r.profile_slug)?PREFIX+"_public/avatar/"+encodeURIComponent(r.profile_slug):null)});
async function pipeline(request,env){
 const original=await service(env,request);if(!original.ok)return original;
 try{const data=await original.clone().json();if(!Array.isArray(data.artists))return original;
  const ass=await assignments(env),mapped=new Map(ass.map(x=>[x.artist_id,personByAssignment(x)]));
  return json({...data,artists:data.artists.map(a=>({...a,assignedAmbassador:mapped.get(a.id)||null}))});
 }catch{return original}
}
async function knowledge(request,env){
 if(request.method!=="GET")return json({error:"Use GET"},405);
 const u=new URL(request.url),kind=(u.searchParams.get("kind")||"tasks").slice(0,35);
 if(kind==="related_works"){
   const id=u.searchParams.get("id");if(!safeID(id))return json({error:"Choose a work"},400);
   const lookup=await service(env,request,PREFIX+"api/item?id="+encodeURIComponent(id));
   if(!lookup.ok)return lookup;const data=await lookup.json();return json(envelope("answer",relatedWorks(data.item,data.related||[]),null,[{collection:"cv_catalog",id}]));
 }
 if(kind==="artists"){
   const r=await service(env,request,PREFIX+"api/workspace/pipeline");if(!r.ok)return r;
   try{const p=await r.json(),ass=await assignments(env),staff=ass.map(x=>({id:x.ambassador_id,name:x.name,profile_slug:x.profile_slug}));const list=artistAssignmentCollection(p.artists,ass,staff);
     return json(envelope("artist_assignments",list,{kind:"staff"},[{collection:"cv_artist_assignments"}]));
   }catch{return json({error:"The artist assignment records are temporarily unavailable."},503)}
 }
 const response=await service(env,request,PREFIX+"api/workspace/overview");if(!response.ok)return response;
 let d;try{d=await response.json()}catch{return json({error:"Workspace unavailable"},503)}
 if(kind==="tasks"||kind==="my_tasks")return json(envelope("task_collection",taskCollection(d,{ownerOnly:kind==="my_tasks"}),d.person,[{collection:"cv_tasks"},{collection:"cv_projects"}]));
 if(kind==="approvals"){const cards=(d.requests||[]).filter(r=>r.stage!=="archived").map(r=>({id:r.id,title:compact(r.title),stage:compact(r.stage),reviewer:compact(r.reviewer_id),link:PREFIX+"workspace/?request="+encodeURIComponent(r.id)}));return json(envelope("answer",{kind:"approval_queue",count:cards.length,cards},d.person,[{collection:"cv_team_requests"}]))}
 if(kind==="team"){const members=(d.team||[]).map(p=>({id:p.id,name:compact(p.name),role:compact(p.role),title:compact(p.title),profile_slug:p.profile_slug}));return json(envelope("answer",{kind:"team_directory",members},d.person,[{collection:"cv_staff"}]))}
 return json({error:"Unsupported knowledge topic"},400);
}
class Head{element(el){el.append('<link rel="stylesheet" href="'+CSS+'" data-cv-experience="20261009">',{html:true})}}
class Body{element(el){el.append('<script defer src="'+JS+'" data-cv-experience="20261009"></script>',{html:true})}}
async function handler(request,env){
 const u=new URL(request.url),path=u.pathname;
 if(path===JS&&request.method==="GET")return plain(EXPERIENCE_JS,"text/javascript; charset=utf-8");
 if(path===CSS&&request.method==="GET")return plain(EXPERIENCE_CSS,"text/css; charset=utf-8");
 if(path===PREFIX+"__experience-health")return json({ok:true,release:"20261009",overlay:true,backend:"communiverse-marketplace"});
 if(path===PREFIX+"api/knowledge/query")return knowledge(request,env);
 if(path===PREFIX+"api/workspace/pipeline"&&request.method==="GET")return pipeline(request,env);
 // Send OAuth, forms, account requests, binary media and every other endpoint unchanged.
 const original=await service(env,request);if(request.method!=="GET"||!original.ok||!(original.headers.get("content-type")||"").includes("text/html"))return original;
 const h=new Headers(original.headers);for(const n of ["content-length","content-encoding","etag","last-modified"])h.delete(n);
 const response=new Response(original.body,{status:original.status,statusText:original.statusText,headers:h});
 return new HTMLRewriter().on("head",new Head()).on("body",new Body()).transform(response);
}
export default{async fetch(request,env,ctx){try{return await handler(request,env)}catch(e){ // Fail open on unmodified routes, never swallow authorization responses.
 if(new URL(request.url).pathname===PREFIX+"__experience-health")return json({ok:false},503);
 return service(env,request).catch(()=>json({error:"Communiverse is temporarily unavailable."},503));
}}};
