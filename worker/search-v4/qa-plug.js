/* Staging-only Plug story panel geometry audit. No backend writes. */
(()=>{"use strict";
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const wait=async(fn,ms=9000)=>{const now=Date.now();do{const v=fn();if(v)return v;await pause(120)}while(Date.now()-now<ms);return null};
const rect=node=>{if(!node)return null;const r=node.getBoundingClientRect();return{x:r.x,y:r.y,left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:r.width,h:r.height}};
const intersects=(a,b,pad=0)=>!!a&&!!b&&a.w>2&&b.w>2&&a.h>2&&b.h>2&&a.left<b.right+pad&&a.right>b.left-pad&&a.top<b.bottom+pad&&a.bottom>b.top-pad;
const take=()=>{const stage=document.querySelector('#constellation'),panel=document.querySelector('#cv-person-work'),body=panel?.querySelector('.glass-panel-body'),work=body?.querySelector('.glass-card[data-card=work]'),story=work?.querySelector('.cv-card-expand'),cards=[...body?.querySelectorAll('.glass-card')||[]],dots=[...stage?.querySelectorAll('a.node[data-slug]')||[]].filter(el=>{const c=getComputedStyle(el),r=rect(el);return c.visibility!=='hidden'&&c.pointerEvents!=='none'&&Number(c.opacity)>.1&&r?.w>12});
 const overlaps=story?dots.map(el=>({slug:el.dataset.slug,rect:rect(el)})).filter(d=>intersects(rect(story),d.rect,4)).slice(0,12):[];
 const galleryAction=stage?.querySelector('.cv-gallery-orbit .cv-gallery-link');
 const galleryOverlap={story:intersects(rect(story),rect(galleryAction),4),card:intersects(rect(work),rect(galleryAction),4),gallery:rect(galleryAction)};
 const siblings=cards.filter(c=>c!==work).map(c=>({kind:c.dataset.card,rect:rect(c)})).filter(c=>intersects(rect(story),c.rect,3));
 return{stage:rect(stage),panel:rect(panel),body:rect(body),work:rect(work),story:rect(story),storyText:story?.textContent.trim(),storyVisible:!!story&&getComputedStyle(story).visibility!=='hidden',storyInsideCard:!!story&&rect(story).bottom<=rect(work).bottom+1.5&&rect(story).left>=rect(work).left-2&&rect(story).right<=rect(work).right+2,cardScroll:work?{scrollHeight:work.scrollHeight,clientHeight:work.clientHeight,overflow:getComputedStyle(work).overflow,maxHeight:getComputedStyle(work).maxHeight,height:getComputedStyle(work).height,cssPosition:getComputedStyle(work).position}:null,visibleCircles:dots.length,overlaps,siblings,galleryOverlap,cssClasses:{plug:document.querySelector('.cv-plug')?.className,stage:stage?.className,work:work?.className},stageScrollWidth:stage?.scrollWidth,pageScrollHeight:document.documentElement.scrollHeight,viewport:innerWidth};
};
async function run(){
 const notes=[];
 try{
 const stage=await wait(()=>document.querySelector('.cv-plug #constellation'),5000);
 if(!stage)throw Error('Plug stage unavailable');
 const visible=[...stage.querySelectorAll('a.node[data-slug]')].filter(el=>getComputedStyle(el).pointerEvents!=='none'&&getComputedStyle(el).visibility!=='hidden');
 const selected=visible.find(el=>rect(el).x>=20&&rect(el).right<=innerWidth-20)||visible[0];
 if(!selected)throw Error('No visible circle');
 selected.click();
 await wait(()=>document.querySelector('#cv-person-work .cv-card-expand'),8500);
 await pause(950);
 const closed=take();
 notes.push({point:'closed',selectedSlug:selected.dataset.slug,...closed});
 const open=document.querySelector('#cv-person-work .cv-card-expand');if(open){open.click();await pause(850);notes.push({point:'expanded',...take()})}
 if(open){open.click();await pause(650);notes.push({point:'collapsedAgain',...take()})}
 // Sample several real profiles: their names, roles and story lengths vary.
 const slugs=[...new Set(visible.map(x=>x.dataset.slug).filter(Boolean))].slice(1,6);
 for(const slug of slugs){
  const target=stage.querySelector('a.node[data-slug="'+CSS.escape(slug)+'"]');
  if(!target)continue;
  target.click();
  await wait(()=>document.querySelector('#cv-person-work .cv-card-expand'),2500);
  await pause(500);
  notes.push({point:'anotherProfile',slug,...take()});
 }
 }catch(e){notes.push({point:'error',error:String(e)})}
 const report=document.createElement('pre');
 report.id='cv4-plug-qa-report';
 report.hidden=true;
 report.textContent=JSON.stringify({checks:notes});
 document.body.append(report);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();