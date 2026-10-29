import retained from './refinement-gateway.mjs';
import STYLE from './sheet-style.txt';
import CLIENT from './sheet-client.txt';
const base='/communiverse/',release='communiverse-sheet-v10-20261013';
const assets=new Map([[base+'__cvsheet_20261013_v10.css',[STYLE,'text/css; charset=utf-8']],[base+'__cvsheet_20261013_v10.js',[CLIENT,'text/javascript; charset=utf-8']]]);
export default{async fetch(request,env,ctx){
 const path=new URL(request.url).pathname,asset=['GET','HEAD'].includes(request.method)&&assets.get(path);
 if(asset)return new Response(request.method==='HEAD'?null:asset[0],{headers:{'content-type':asset[1],'cache-control':'public,max-age=31536000,immutable','x-content-type-options':'nosniff','cross-origin-resource-policy':'same-origin','x-communiverse-sheet':release}});
 const response=await retained.fetch(request,env,ctx);
 if(request.method!=='GET'||path!==base+'workspace/'||!response.ok||!String(response.headers.get('content-type')||'').includes('text/html'))return response;
 const headers=new Headers(response.headers);for(const n of ['content-length','content-encoding','etag','last-modified'])headers.delete(n);headers.set('x-communiverse-sheet',release);
 return new HTMLRewriter().on('head',{element(e){e.append('<link rel="stylesheet" href="'+base+'__cvsheet_20261013_v10.css">',{html:true})}}).on('body',{element(e){e.append('<script defer src="'+base+'__cvsheet_20261013_v10.js"></script>',{html:true})}}).transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}};
