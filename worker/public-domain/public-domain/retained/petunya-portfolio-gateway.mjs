import retained from './brand-clubs-gateway.mjs';
const STYLE='html[data-cv-social] .cv-pin[data-id^="work-ms-petunya-"] .cv-pin-media>img{aspect-ratio:auto;min-height:0;max-height:none;object-fit:contain;transform:none}';
export default{async fetch(request,env,ctx){
 const response=await retained.fetch(request,env,ctx),url=new URL(request.url);
 if(request.method!=='GET'||!url.pathname.startsWith('/communiverse/')||!response.ok||!String(response.headers.get('content-type')).includes('text/html'))return response;
 const headers=new Headers(response.headers);for(const name of['content-length','content-encoding','etag','last-modified'])headers.delete(name);headers.set('x-communiverse-petunya','portfolio-20261020');
 return new HTMLRewriter().on('head',{element(e){e.append('<style data-cv-petunya-portfolio>'+STYLE+'</style>',{html:true});}}).transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}};
