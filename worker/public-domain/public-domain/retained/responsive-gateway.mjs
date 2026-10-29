import retained from './wetex-exhibition-gateway.mjs';
import CSS from './responsive-v24.css';
import CLIENT from './responsive-v24.js';
import WORKSPACE from './v3-client.txt';
import SHEET from './sheet-client.txt';
import REFINEMENT from './refinement-client-v9.txt';
import NAV from './circles-mobile-v13.txt';
import CIRCLES from './circles-focus.txt';
const ROOT='/communiverse/',BASE=ROOT+'_responsive/20261022-v25/',RELEASE='responsive-20261022-v25';
const assets=new Map([['layout.css',[CSS,'text/css']],['layout.js',[CLIENT,'text/javascript']],['workspace.js',[WORKSPACE,'text/javascript']],['sheet.js',[SHEET,'text/javascript']],['refinement.js',[REFINEMENT,'text/javascript']],['navigation.js',[NAV,'text/javascript']],['circles.js',[CIRCLES,'text/javascript']]]);
const replace=new Map([[ROOT+'__cvux_v3.js','workspace.js'],[ROOT+'__cvsheet_20261013_v10.js','sheet.js'],[ROOT+'__cvrefine_20261013_v9_1.js','refinement.js'],[ROOT+'__cvcircles_mobile_20261019_v13.js','navigation.js'],[ROOT+'__cvcircles_focus_20261013_v8.js','circles.js']]);
export default{async fetch(request,env,ctx){
 const path=new URL(request.url).pathname,asset=path.startsWith(BASE)&&assets.get(path.slice(BASE.length));
 if(asset&&['GET','HEAD'].includes(request.method))return new Response(request.method==='HEAD'?null:asset[0],{headers:{'content-type':asset[1]+'; charset=utf-8','cache-control':'public,max-age=31536000,immutable','x-content-type-options':'nosniff','cross-origin-resource-policy':'same-origin','x-communiverse-responsive':RELEASE}});
 const response=await retained.fetch(request,env,ctx);
 if(request.method!=='GET'||!path.startsWith(ROOT)||!response.ok||!response.headers.get('content-type')?.includes('text/html'))return response;
 const headers=new Headers(response.headers);for(const name of ['content-length','content-encoding','etag','last-modified'])headers.delete(name);
 headers.set('x-communiverse-responsive',RELEASE);
 return new HTMLRewriter().on('html',{element(e){e.setAttribute('class',((e.getAttribute('class')||'')+' cv-responsive-v24').trim())}})
 .on('head',{element(e){e.append('<link rel="stylesheet" href="'+BASE+'layout.css">',{html:true})}})
 .on('script[src]',{element(e){const replacement=replace.get((e.getAttribute('src')||'').split('?')[0]);if(replacement)e.setAttribute('src',BASE+replacement)}})
 .on('body',{element(e){e.append('<script defer src="'+BASE+'layout.js"></script>',{html:true})}})
 .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}};
