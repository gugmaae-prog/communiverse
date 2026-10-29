/* Presentation-only successor: restores the people-as-circles composition on phones. */
import retained from './circles-mobile-gateway.mjs';
import STYLE from './circles-mobile-v14.css';
import FILTER_STYLE from './circles-filter-v19.css';

const ROOT='/communiverse/';
const RELEASE='communiverse-circles-filter-v19-20261020';
const filterAssetPath=ROOT+'__cvcircles_filters_20261020_v19.css';
const assetPath=ROOT+'__cvcircles_mobile_20261019_v14.css';

class PageClass {
  element(element) {
    element.setAttribute('class',`${element.getAttribute('class')||''} cv-mobile-v14`.trim());
    element.setAttribute('data-cv-circles-mobile-shape',RELEASE);
  }
}
class Head {
  element(element) {
    element.append(`<link rel="stylesheet" href="${assetPath}"><link rel="stylesheet" href="${filterAssetPath}">`,{html:true});
  }
}

export default {
  async fetch(request,env,ctx) {
    const url=new URL(request.url),path=url.pathname;
    // The retained presentation layers match /communiverse/ and its children.
    // Normalize the bare home URL before it can serve the legacy navigation.
    if((request.method==='GET'||request.method==='HEAD')&&path==='/communiverse') {
      url.pathname=ROOT;
      return new Response(null,{status:308,headers:{
        location:url.href,
        'cache-control':'no-store',
        'x-communiverse-home-route':'20261019-v15',
      }});
    }
    if((request.method==='GET'||request.method==='HEAD')&&(path===assetPath||path===filterAssetPath))return new Response(request.method==='HEAD'?null:path===filterAssetPath?FILTER_STYLE:STYLE,{headers:{
      'content-type':'text/css; charset=utf-8',
      'cache-control':'public, max-age=31536000, immutable',
      'cross-origin-resource-policy':'same-origin',
      'x-content-type-options':'nosniff',
      'x-communiverse-release':RELEASE,
    }});
    let response=await retained.fetch(request,env,ctx);
    // Preserve the full composition of this supplied portfolio's interior mockups.
    // Only public portfolio routes and these work IDs receive the display override.
    if(request.method==='GET'&&/^\/communiverse\/(?:$|(?:discover|artists|artist|works|gallery)\/(?:$|[?]))/.test(path)&&response.ok&&String(response.headers.get('content-type')||'').includes('text/html')) {
      const portfolioHeaders=new Headers(response.headers);
      for(const name of ['content-length','content-encoding','etag','last-modified'])portfolioHeaders.delete(name);
      portfolioHeaders.set('x-communiverse-portfolio','chandni-padia-20261020');
      response=new HTMLRewriter().on('head',{element(element){element.append('<style data-cv-chandni-portfolio>'+"html[data-cv-social] .cv-pin[data-id^=\"work-chandni-padia-\"] .cv-pin-media>img{aspect-ratio:auto;min-height:0;max-height:none;object-fit:contain;transform:none}"+'</style>',{html:true});}})
        .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers:portfolioHeaders}));
    }
    if(request.method!=='GET'||!/^\/communiverse\/circles(?:\/|$)/.test(path)||!response.ok||!String(response.headers.get('content-type')||'').includes('text/html'))return response;
    const headers=new Headers(response.headers);
    for(const name of ['content-length','content-encoding','etag','last-modified'])headers.delete(name);
    headers.set('x-communiverse-release',RELEASE);
    return new HTMLRewriter()
      .on('html',new PageClass())
      .on('head',new Head())
      .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
  },
};
