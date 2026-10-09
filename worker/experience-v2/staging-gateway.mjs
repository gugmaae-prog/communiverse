/* Communiverse QA staging gateway. NOT for production routing. */
import CLIENT from './client.txt';
import CSS from './style.txt';
import FIXTURE from './fixture.txt';
import QA from './qa.txt';
const base='/communiverse/';
const json=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':'no-store','x-cv-stage':'1'}});
const asset=(data,type)=>new Response(data,{headers:{'content-type':type,'cache-control':'no-store','x-content-type-options':'nosniff','x-cv-stage':'1'}});
const demo={
 person:{id:'keiffer',name:'Keiffer',profile_slug:'cv-keiffer',photo:'/communiverse/_public/avatar/cv-keiffer'},
 team:[{id:'keiffer',name:'Keiffer',profile_slug:'cv-keiffer',photo:'/communiverse/_public/avatar/cv-keiffer'},{id:'haseeb',name:'Haseeb',profile_slug:'cv-haseeb',photo:'/communiverse/_public/avatar/cv-haseeb'},{id:'luna',name:'Luna',profile_slug:'cv-luna',photo:'/communiverse/_public/avatar/cv-luna'}],
 projects:[{id:'project-1',title:'Ambassador Programme',owner_id:'haseeb'}],
 tasks:[{id:'task-1',title:'Review footage with Luna',description:'Review the submitted footage and identify next steps.',owner_id:'keiffer',created_by:'haseeb',project_id:'project-1',status:'blocked',due_date:'2026-10-09',priority:'high',approval_required:1},
 {id:'task-2',title:'Approve briefing',owner_id:'haseeb',created_by:'keiffer',project_id:'project-1',status:'done',due_date:'2026-10-12',priority:'normal'}]
};
class Head{element(node){node.append('<link rel="stylesheet" href="/communiverse/__cvfix_v2.css" data-stage-cvfix-v2="true">',{html:true})}}
class Body{element(node){node.append('<script defer src="/communiverse/__cvfix_v2.js" data-stage-cvfix-v2="true"></script>',{html:true})}}
export default{
 async fetch(request,env){
   const u=new URL(request.url),p=u.pathname;
   if(p===base+'__qa-fixture')return new Response(FIXTURE,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'"}});
   if(p===base+'__cvfix_v2.js')return asset(CLIENT,'text/javascript; charset=utf-8');
   if(p===base+'__cvfix_v2.css')return asset(CSS,'text/css; charset=utf-8');
   if(p===base+'__cvfix_qa_runner.js')return asset(QA,'text/javascript; charset=utf-8');
   if(p===base+'api/workspace/overview')return json(demo);
   if(p===base+'api/knowledge/artist-assignments')return json({assignments:[{artistId:'artist-1',relationship:'assigned ambassador',person:{id:'luna',name:'Luna',profile_slug:'cv-luna',photo_url:'/communiverse/_public/avatar/cv-luna'},verifiedOnboarder:false}]});
   if(p===base+'__cv-qa-health')return json({ok:true,staging:true});
   if(!env.MARKETPLACE)return json({error:'No staging origin'},503);
   const upstream=new URL(request.url);upstream.host='espacios.me';upstream.protocol='https:';
   const origin=await env.MARKETPLACE.fetch(new Request(upstream,request));
   if(request.method!=='GET'||!origin.ok||!String(origin.headers.get('content-type')).includes('text/html'))return origin;
   const h=new Headers(origin.headers);for(const name of ['content-length','content-encoding','etag'])h.delete(name);
   const response=new Response(origin.body,{status:origin.status,headers:h});
   return new HTMLRewriter().on('head',new Head()).on('body',new Body()).transform(response);
 }
};
