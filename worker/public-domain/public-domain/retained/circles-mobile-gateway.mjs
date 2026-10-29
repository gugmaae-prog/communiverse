/* Presentation-only successor for mobile Circles navigation and paging. */
import retained from './welcome-gateway.mjs';
import STYLE from './circles-mobile-v13.css';
import CLIENT from './circles-mobile-v13.txt';

const ROOT='/communiverse/';
const RELEASE='communiverse-circles-mobile-v13-20261019';
const assets=new Map([
  [ROOT+'__cvcircles_mobile_20261019_v13.css',[STYLE,'text/css; charset=utf-8']],
  [ROOT+'__cvcircles_mobile_20261019_v13.js',[CLIENT,'text/javascript; charset=utf-8']],
]);

class PageClass {
  element(element) {
    element.setAttribute('class',`${element.getAttribute('class')||''} cv-mobile-v13`.trim());
    element.setAttribute('data-cv-circles-mobile',RELEASE);
  }
}
class Head {
  element(element) {
    element.append(`<link rel="stylesheet" href="${ROOT}__cvcircles_mobile_20261019_v13.css">`,{html:true});
  }
}
class Body {
  element(element) {
    element.append(`<script defer src="${ROOT}__cvcircles_mobile_20261019_v13.js"></script>`,{html:true});
  }
}

export default {
  async fetch(request,env,ctx) {
    const url=new URL(request.url),path=url.pathname;
    const read=request.method==='GET'||request.method==='HEAD';
    const asset=read&&assets.get(path);
    if(asset)return new Response(request.method==='HEAD'?null:asset[0],{headers:{
      'content-type':asset[1],
      'cache-control':'public, max-age=31536000, immutable',
      'cross-origin-resource-policy':'same-origin',
      'x-content-type-options':'nosniff',
      'x-communiverse-release':RELEASE,
    }});
    if(request.method==='GET'&&path===ROOT+'__cvcircles_mobile_v13_health')return Response.json({ok:true,release:RELEASE,scope:'presentation-only'},{headers:{'cache-control':'no-store'}});

    const response=await retained.fetch(request,env,ctx);
    const isPage=path.startsWith(ROOT)&&!path.startsWith(ROOT+'api/')&&!path.startsWith(ROOT+'_public/');
    if(request.method!=='GET'||!isPage||!response.ok||!String(response.headers.get('content-type')||'').includes('text/html'))return response;

    const headers=new Headers(response.headers);
    for(const name of ['content-length','content-encoding','etag','last-modified'])headers.delete(name);
    headers.set('x-communiverse-release',RELEASE);
    return new HTMLRewriter()
      .on('html',new PageClass())
      .on('head',new Head())
      .on('body',new Body())
      .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
  },
};
