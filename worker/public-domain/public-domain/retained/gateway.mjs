/* Mobile/Circles presentation successor; canonical backend and retained modules are unchanged. */
import retained from './gateway-retained.mjs';
import MOBILE_CSS from './mobile-style.txt';
import MOBILE_JS from './mobile-client.txt';
import CIRCLES_JS from './circles-focus.txt';
import NAV_JS from './circles-nav.txt';
import REFRESH_JS from './circles-refresh.txt';
const RELEASE = 'communiverse-mobile-circles-20261013-v8';
const ROOT = '/communiverse/';
const assets = new Map([
  [ROOT+'__cvmobile_20261013_v8.css', [MOBILE_CSS, 'text/css; charset=utf-8']],
  [ROOT+'__cvmobile_20261013_v8.js', [MOBILE_JS, 'text/javascript; charset=utf-8']],
  [ROOT+'__cvcircles_focus_20261013_v8.js', [CIRCLES_JS, 'text/javascript; charset=utf-8']],
  [ROOT+'__cvcircles_nav_20261013_v8.js', [NAV_JS, 'text/javascript; charset=utf-8']],
  [ROOT+'__cvcircles_refresh_20261019_v18.js', [REFRESH_JS, 'text/javascript; charset=utf-8']],
]);
const successors = new Map([
  [ROOT+'_public/20261011-light-focus.js', ROOT+'__cvcircles_focus_20261013_v8.js'],
  [ROOT+'_public/20261008-simple-nav-1.js', ROOT+'__cvcircles_nav_20261013_v8.js'],
  [ROOT+'_public/20261012-cosmos-refresh-main.js', ROOT+'__cvcircles_refresh_20261019_v18.js'],
]);
class PageClass {
  element(e) {e.setAttribute('class', ((e.getAttribute('class') || '')+' cv-mobile-v8').trim());}
}
class Head {
  element(e) {e.append('<link rel="stylesheet" href="'+ROOT+'__cvmobile_20261013_v8.css"><style>body:has(#cv-feed):not(:has(#cv-feed .cv-pin[data-id])) .cv-loop-toggle,body:has(#cv-artists):not(:has(#cv-artists .cv-artist-pin)) .cv-loop-toggle{display:none}.cv-work-facts{display:grid;gap:12px;margin:20px 0}.cv-work-facts div{display:grid;grid-template-columns:92px 1fr;gap:12px}.cv-work-facts dt{opacity:.7}.cv-work-facts dd{margin:0;overflow-wrap:anywhere}.cv-artist-links{flex-wrap:wrap}#cv-artist-profile img{object-position:center 38%}.cv-profile-cover{margin:0;min-width:0}.cv-profile-cover-open{display:block;width:100%;border:0;padding:0;background:transparent;cursor:pointer}.cv-profile-cover figcaption{font-size:13px;margin-top:12px;color:var(--cv-social-muted)}.cv-artist-work-controls{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin:24px 0 40px}.cv-work-layout h2{overflow-wrap:anywhere}.cv-profile-cover-open:focus-visible{outline:3px solid var(--cv-social-blue);outline-offset:5px;border-radius:24px}</style>', {html:true});}
}
class Body {
  element(e) {e.append('<script defer src="'+ROOT+'__cvmobile_20261013_v8.js"></script>', {html:true});}
}
class Script {
  element(e) {const next=successors.get((e.getAttribute('src') || '').split('?')[0]); if(next)e.setAttribute('src', next);}
}
class CircleLink {
  element(e) {
    // Owned navigation only. User-authored names, data, identifiers and legacy URLs stay untouched.
    if ((e.getAttribute('href') || '').split('?')[0].replace(/\/$/,'') === ROOT+'plug') {
      e.setAttribute('href',ROOT+'circles/');
      e.setInnerContent('Circles');
      const label=e.getAttribute('aria-label');
      if(label && /\bPlug\b/.test(label))e.setAttribute('aria-label',label.replace(/\bPlug\b/g,'Circles'));
    }
  }
}
class CircleTitle {
  element(e) {e.setInnerContent('Circles | Communiverse');}
}
export default {
  async fetch(request, env, ctx) {
    const path=new URL(request.url).pathname;
    const read=request.method === 'GET' || request.method === 'HEAD';
    const asset=read && assets.get(path);
    if(asset) return new Response(request.method==='HEAD' ? null : asset[0], {headers:{
      'content-type':asset[1], 'cache-control':'public, max-age=31536000, immutable',
      'x-content-type-options':'nosniff', 'cross-origin-resource-policy':'same-origin',
      'x-communiverse-release':RELEASE,
    }});
    if(request.method==='GET' && path===ROOT+'__cvmobile_v8_health')return Response.json({ok:true, release:RELEASE, scope:'presentation-only', aiCellGeneration:false, paidCallingEnabled:false}, {headers:{'cache-control':'no-store'}});
    const response=await retained.fetch(request,env,ctx);
    if(request.method!=='GET' || !path.startsWith(ROOT) || path.startsWith(ROOT+'api/') || path.startsWith(ROOT+'_public/') || !response.ok || !String(response.headers.get('content-type') || '').includes('text/html'))return response;
    const headers=new Headers(response.headers);
    for(const name of ['content-length','content-encoding','etag','last-modified'])headers.delete(name);
    headers.set('x-communiverse-release',RELEASE);
    let rewrite=new HTMLRewriter().on('html',new PageClass()).on('head',new Head()).on('body',new Body()).on('script[src]',new Script()).on('#cv-social-header nav a, #cv-shared-header nav a, #cv-marketplace-nav a, footer a, nav[aria-label="Footer navigation"] a',new CircleLink())
    .on('a[href^="/communiverse/plug"]',{element(e){const href=e.getAttribute('href');if(href)e.setAttribute('href',href.replace(/^\/communiverse\/plug(?=\/|$)/,'/communiverse/circles'));}})
    .on('p',{text(t){const updates=new Map([
      ['The founders, partners and team already introduced on Plug.','The founders, partners and team already introduced on Circles.'],
      ['Explore craft, pictured work and the people who make it. Current artist cards are fictional previews.','Meet the artists through their practice and the stories behind their work.'],
      ['Our launch collection explores generated artist stories, objects and process imagery. Films are craft references. Prices are guides; makers, stock, dates and final prices are confirmed before any order or session.','Artist profiles and collections will appear here as they are published.']
    ]);let text=t.text;for(const [before,after]of updates)text=text.replace(before,after);if(text!==t.text)t.replace(text);}});
    if(path.replace(/\/$/,'')===ROOT+'plug')rewrite=rewrite.on('title',new CircleTitle());
    return rewrite.transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
  },
};
