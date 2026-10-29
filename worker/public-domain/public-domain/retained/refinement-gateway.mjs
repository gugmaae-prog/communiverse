import retained from './gateway.mjs';
import STYLE from './refinement-style.txt';
import CLIENT from './refinement-client.txt';
import PREVIOUS_STYLE from './refinement-style-v9.txt';
import PREVIOUS_CLIENT from './refinement-client-v9.txt';
const ROOT='/communiverse/',RELEASE='communiverse-ui-refinement-20261013-v9-1';
const assets=new Map([[ROOT+'__cvrefine_20261013_v9_1.css',[STYLE,'text/css; charset=utf-8']],[ROOT+'__cvrefine_20261013_v9_1.js',[CLIENT,'text/javascript; charset=utf-8']],[ROOT+'__cvrefine_20261013_v9.css',[PREVIOUS_STYLE,'text/css; charset=utf-8']],[ROOT+'__cvrefine_20261013_v9.js',[PREVIOUS_CLIENT,'text/javascript; charset=utf-8']]]);
class RootClass{element(e){e.setAttribute('class',((e.getAttribute('class')||'')+' cv-refinement-v9').trim())}}
class Head{element(e){e.append('<link rel="stylesheet" href="'+ROOT+'__cvrefine_20261013_v9_1.css">',{html:true})}}
class Body{element(e){e.append('<script defer src="'+ROOT+'__cvrefine_20261013_v9_1.js"></script>',{html:true})}}
export default{async fetch(request,env,ctx){
 const path=new URL(request.url).pathname,read=['GET','HEAD'].includes(request.method),asset=read&&assets.get(path);
 if(asset)return new Response(request.method==='HEAD'?null:asset[0],{headers:{'content-type':asset[1],'cache-control':'public,max-age=31536000,immutable','x-content-type-options':'nosniff','cross-origin-resource-policy':'same-origin','x-communiverse-refinement':RELEASE}});
 const response=await retained.fetch(request,env,ctx);
 if(request.method!=='GET'||!path.startsWith(ROOT)||path.startsWith(ROOT+'api/')||path.startsWith(ROOT+'_public/')||!response.ok||!String(response.headers.get('content-type')||'').includes('text/html'))return response;
 const headers=new Headers(response.headers);for(const name of ['content-length','content-encoding','etag','last-modified'])headers.delete(name);
 headers.set('x-communiverse-refinement',RELEASE);
 return new HTMLRewriter().on('html',new RootClass()).on('head',new Head()).on('body',new Body()).transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}};
