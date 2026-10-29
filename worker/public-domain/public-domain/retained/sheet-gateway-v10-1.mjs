import retained from './sheet-gateway.mjs';
import STYLE from './sheet-style-v10-1.txt';
const asset='/communiverse/__cvsheet_20261013_v10_1.css',release='communiverse-sheet-v10-1-20261013';
export default{async fetch(request,env,ctx){
 const path=new URL(request.url).pathname;
 if(path===asset&&['GET','HEAD'].includes(request.method))return new Response(request.method==='HEAD'?null:STYLE,{headers:{'content-type':'text/css; charset=utf-8','cache-control':'public,max-age=31536000,immutable','x-content-type-options':'nosniff','cross-origin-resource-policy':'same-origin','x-communiverse-sheet':release}});
 const response=await retained.fetch(request,env,ctx);
 if(request.method!=='GET'||path!=='/communiverse/workspace/'||!response.ok||!String(response.headers.get('content-type')||'').includes('text/html'))return response;
 const headers=new Headers(response.headers);for(const n of ['content-length','content-encoding','etag','last-modified'])headers.delete(n);headers.set('x-communiverse-sheet',release);
 return new HTMLRewriter().on('head',{element(e){e.append('<link rel="stylesheet" href="'+asset+'">',{html:true})}}).transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}};
