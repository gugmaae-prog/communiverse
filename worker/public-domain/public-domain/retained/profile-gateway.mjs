import retained from './sheet-gateway-v10-1.mjs';
import STYLE from './profile-style.txt';
import CLIENT from './profile-client.txt';
import profile from './profile-api.mjs';
const base='/communiverse/',release='communiverse-profile-v11-20261013';
const assets=new Map([[base+'__cvprofile_20261013_v11.css',[STYLE,'text/css; charset=utf-8']],[base+'__cvprofile_20261013_v11.js',[CLIENT,'text/javascript; charset=utf-8']]]);
export default{async fetch(request,env,ctx){
 const url=new URL(request.url),path=url.pathname,asset=['GET','HEAD'].includes(request.method)&&assets.get(path);
 if(asset)return new Response(request.method==='HEAD'?null:asset[0],{headers:{'Content-Type':asset[1],'Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin','X-Communiverse-Profile':release}});
 if(path.startsWith(base+'workspace/profile/')||(path.replace(/\/$/,'')===base+'auth/callback'&&(url.hostname==='mail.espacios.me'||url.searchParams.get('state')?.startsWith('profile-')))){const response=await profile.fetch(request,env);const headers=new Headers(response.headers);headers.set('X-Communiverse-Profile',release);return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}
 const response=await retained.fetch(request,env,ctx);
 if(request.method!=='GET'||!['/communiverse/workspace/','/communiverse/plug/','/communiverse/profile/'].includes(path)||!response.ok||!String(response.headers.get('Content-Type')||'').includes('text/html'))return response;
 const headers=new Headers(response.headers);for(const n of ['content-length','content-encoding','etag','last-modified'])headers.delete(n);headers.set('X-Communiverse-Profile',release);
 return new HTMLRewriter().on('head',{element(e){e.append('<link rel="stylesheet" href="'+base+'__cvprofile_20261013_v11.css">',{html:true});}}).on('body',{element(e){e.append('<script defer src="'+base+'__cvprofile_20261013_v11.js"></script>',{html:true});}}).transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}};
