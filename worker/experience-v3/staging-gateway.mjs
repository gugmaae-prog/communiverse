/* Isolated QA staging. Never deploy on production routes. */
import CV3_JS from './v3-client.txt';
import CV3_CSS from './v3-style.txt';
import FIXTURE from './fixture.txt';
import QA from './qa.txt';
import QA_PUBLIC from './qa-public.txt';
const ROOT='/communiverse/';
const V2_SCRIPT=ROOT+'__cvfix_v2.js',V2_STYLE=ROOT+'__cvfix_v2.css',SCRIPT=ROOT+'__cvux_v3.js',STYLE=ROOT+'__cvux_v3.css';
const demo={person:{id:'keiffer',name:'Keiffer',role:'ambassador-lead',profile_slug:'cv-keiffer',photo:'/communiverse/_public/avatar/cv-keiffer'},team:[{id:'keiffer',name:'Keiffer',role:'ambassador-lead',profile_slug:'cv-keiffer',photo:'/communiverse/_public/avatar/cv-keiffer'},{id:'haseeb',name:'Haseeb',role:'ceo',profile_slug:'cv-haseeb',photo:'/communiverse/_public/avatar/cv-haseeb'},{id:'elferah',name:'Elferah',role:'operations',profile_slug:'cv-elferah',photo:'/communiverse/_public/avatar/cv-elferah'},{id:'luna',name:'Luna',role:'ambassador',profile_slug:'cv-luna',photo:'/communiverse/_public/avatar/cv-luna'}],projects:[{id:'project-1',title:'Ambassador Programme',owner_id:'keiffer'},{id:'project-2',title:'Brand and media',owner_id:'haseeb'}],tasks:[{id:'task-1',title:'Review filming kit',status:'blocked',project_id:'project-1',owner_id:'keiffer',created_by:'luna',priority:'high',description:'Awaiting camera and supplies',due_date:'2026-10-09'},{id:'task-2',title:'Approve artist press sheet',status:'review',project_id:'project-2',owner_id:'haseeb',created_by:'keiffer',priority:'normal',due_date:'2026-10-13'}],requests:[{id:'request-1',title:'Camera kit',kind:'kit',reviewer_id:'keiffer',created_by:'luna',stage:'keiffer'}]};
const json=(payload,status=200)=>Response.json(payload,{status,headers:{'cache-control':'no-store','x-cv-stage':'true'}});
const asset=(req,data,type)=>new Response(req.method==='HEAD'?null:data,{headers:{'content-type':type,'cache-control':'no-store'}});
class Head{element(e){e.append('<link rel="stylesheet" href="'+V2_STYLE+'"><link rel="stylesheet" href="'+STYLE+'">',{html:true})}}
class Body{constructor(qa){this.qa=qa}element(e){e.append('<script defer src="'+V2_SCRIPT+'"></script><script defer src="'+SCRIPT+'"></script>'+(this.qa?'<script defer src="/communiverse/__cvux_public_qa.js"></script>':''),{html:true})}}
export default {async fetch(req,env){const u=new URL(req.url),p=u.pathname;
 if(p===ROOT+'__cvux_qa_fixture')return asset(req,FIXTURE,'text/html; charset=utf-8');
 if(p===ROOT+'__cvux_v3.js')return asset(req,CV3_JS,'text/javascript; charset=utf-8');
 if(p===ROOT+'__cvux_v3.css')return asset(req,CV3_CSS,'text/css; charset=utf-8');
 if(p===ROOT+'__cvux_qa.js')return asset(req,QA,'text/javascript; charset=utf-8');
 if(p===ROOT+'__cvux_public_qa.js')return asset(req,QA_PUBLIC,'text/javascript; charset=utf-8');
 if(p===ROOT+'__cvux_qa_health')return json({ok:true,staging:true,release:'20261009-v3'});
 if(p===ROOT+'api/workspace/overview')return json(demo);
 if(p===ROOT+'api/knowledge/artist-assignments')return json({assignments:[{artistId:'artist-1',person:{id:'luna',name:'Luna',profile_slug:'cv-luna'}}]});
 if(!env.MARKETPLACE)return json({error:'Staging backend unavailable'},503);
 const upstreamURL=new URL(req.url);upstreamURL.protocol='https:';upstreamURL.host='espacios.me';const upstream=await env.MARKETPLACE.fetch(new Request(upstreamURL,req));
 if(!upstream.ok||req.method!=='GET'||!String(upstream.headers.get('content-type')||'').includes('text/html'))return upstream;
 const headers=new Headers(upstream.headers);for(const k of ['content-length','content-encoding','etag','last-modified'])headers.delete(k);
 return new HTMLRewriter().on('head',new Head()).on('body',new Body(p===ROOT)).transform(new Response(upstream.body,{status:upstream.status,headers}));
 }};
