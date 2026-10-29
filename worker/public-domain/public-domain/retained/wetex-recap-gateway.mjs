import retained from './avid-event-gateway.mjs';
import RECAP from './wetex-recap.html';
import CSS from './wetex-recap.css';
import JS from './wetex-recap.js';
import PHOTO_1 from './wetex-recap-photo-1.jpg';
import PHOTO_2 from './wetex-recap-photo-2.jpg';
import PHOTO_3 from './wetex-recap-photo-3.jpg';
import PHOTO_4 from './wetex-recap-photo-4.jpg';
import PHOTO_5 from './wetex-recap-photo-5.jpg';
import PHOTO_6 from './wetex-recap-photo-6.jpg';
import PHOTO_7 from './wetex-recap-photo-7.jpg';
import PHOTO_8 from './wetex-recap-photo-8.jpg';
import PHOTO_9 from './wetex-recap-photo-9.jpg';
const ROOT='/communiverse/',ROUTE=ROOT+'exhibitions/wetex-2026/',BASE=ROOT+'_exhibitions/wetex-recap-20261022-v2/',RELEASE='wetex-recap-20261022-v2';
const assets=new Map([['recap.css',[CSS,'text/css; charset=utf-8']],['recap.js',[JS,'text/javascript; charset=utf-8']],...[[PHOTO_1,1],[PHOTO_2,2],[PHOTO_3,3],[PHOTO_4,4],[PHOTO_5,5],[PHOTO_6,6],[PHOTO_7,7],[PHOTO_8,8],[PHOTO_9,9]].map(([photo,n])=>['photo-'+n+'.jpg',[photo,'image/jpeg']])]);
const description='Photos and artworks from the Communiverse × NOA showcase at WETEX 2026, Dubai World Trade Centre. Paintings, collage, sculpture and moments from the exhibition.';
export default{async fetch(request,env,ctx){
 const path=new URL(request.url).pathname,read=['GET','HEAD'].includes(request.method),asset=path.startsWith(BASE)&&assets.get(path.slice(BASE.length));
 if(read&&asset)return new Response(request.method==='HEAD'?null:asset[0],{headers:{'content-type':asset[1],'cache-control':'public,max-age=31536000,immutable','x-content-type-options':'nosniff','x-communiverse-wetex-recap':RELEASE}});
 const response=await retained.fetch(request,env,ctx);
 const wetex=path===ROUTE,featured=[ROOT,ROOT+'discover/',ROOT+'events/'].includes(path);
 if(request.method!=='GET'||(!wetex&&!featured)||!response.ok||!response.headers.get('content-type')?.includes('text/html'))return response;
 const headers=new Headers(response.headers);for(const key of ['content-length','content-encoding','etag','last-modified'])headers.delete(key);headers.set('x-communiverse-wetex-recap',RELEASE);
 let rewriter=new HTMLRewriter().on('.cv-wetex-feature:not(.cv-wakos-feature) .cv-wetex-cta',{element(e){e.setInnerContent('See the art & photos ↗')}});
 if(wetex)rewriter=rewriter.on('head',{element(e){e.append('<link rel="stylesheet" href="'+BASE+'recap.css"><meta property="og:image:width" content="1280"><meta property="og:image:height" content="960"><meta property="og:image:alt" content="Visitors with artworks at the Communiverse and NOA showcase.">',{html:true})}})
 .on('body',{element(e){e.append('<script defer src="'+BASE+'recap.js"></script>',{html:true})}})
 .on('#artworks',{element(e){e.before(RECAP,{html:true})}})
 .on('.exhibition-nav',{element(e){e.prepend('<a href="#from-wetex">Photos from WETEX</a>',{html:true})}})
 .on('.hero-copy .primary',{element(e){e.after('<a class="wetex-recap-jump" href="#from-wetex">See photos from WETEX <span aria-hidden="true">↓</span></a>',{html:true})}})
 .on('meta[property="og:image"]',{element(e){e.setAttribute('content','https://espacios.me'+BASE+'photo-8.jpg')}})
 .on('meta[name="description"],meta[property="og:description"]',{element(e){e.setAttribute('content',description)}})
 .on('.image-note p',{element(e){e.setInnerContent('Some catalogue images were edited with AI to improve clarity or remove the surrounding room. The three interior venue photos were tidied to remove the green markings and show the space before installation. The photographs in Scenes from WETEX are shown as supplied. Where we haven’t received an artwork’s title, we’ve used a description and noted it with the work.')}});
 return rewriter.transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}};
