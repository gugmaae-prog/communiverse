/* Live-readonly public artwork E2E on Cloudflare staging. */
(()=>{'use strict';const tests=[];const mark=(name,ok,details='')=>tests.push({name,pass:!!ok,details:String(details).slice(0,120)});
const wait=async(fn,ms=11000)=>{const start=Date.now();while(Date.now()-start<ms){const v=fn();if(v)return v;await new Promise(r=>setTimeout(r,140))}return null};
async function run(){try{
 await wait(()=>window.__cvExperienceV3?.ready,3000);mark('V3 script initialized',window.__cvExperienceV3?.ready===true);
 mark('Communiverse header survives',!!document.querySelector('#cv-social-header nav'));
 const tile=await wait(()=>document.querySelector('#cv-feed>.cv-pin [data-open]'),10000);mark('Real artwork gallery loads',!!tile);
 if(tile){const first=tile.dataset.open;tile.click();const layout=await wait(()=>document.querySelector('#cv-work-detail .cv-work-layout h2'),12000);mark('Native click opens a real artwork',!!layout);mark('Detail links to clicked ID',new URL(location.href).searchParams.get('work')===first);
 const about=await wait(()=>document.querySelector('#cv-work-detail .cv3-work-extra'),4500);mark('Full-width below-image credits reflow',!!about&&!!about.previousElementSibling?.classList.contains('cv-work-layout'));
 if(about){const hero=about.previousElementSibling;const ratio=about.getBoundingClientRect().width/Math.max(1,hero.getBoundingClientRect().width);mark('Credits occupy full artwork width',ratio>=.94,'ratio='+ratio.toFixed(2))}
 const tags=about?.querySelector('.cv3-work-tags');mark('Real artwork tags preserved',!!tags&&tags.children.length>0);
 mark('Artwork image/video retained',!!document.querySelector('#cv-work-detail .cv-work-layout img,#cv-work-detail .cv-work-layout video'));
 const current=document.querySelector('#cv-work-detail .cv-work-layout h2')?.textContent;
 const related=await wait(()=>document.querySelector('#cv-work-detail .cv-related [data-open]'),4000);mark('Native recommended-work controls available',!!related);
 if(related){const dest=related.dataset.open;related.click();const newTitle=await wait(()=>{const next=document.querySelector('#cv-work-detail .cv-work-layout h2');return next?.textContent!==current?next:null},11000);mark('Related-work click shows next real work',!!newTitle);mark('URL records selected next work',new URL(location.href).searchParams.get('work')===dest);await new Promise(r=>setTimeout(r,250));const stale=[...document.querySelectorAll('#cv-feed>.is-work-expanded')].filter(c=>c.dataset.id!==dest);mark('No stale expanded tiles',stale.length===0,'stale='+stale.length)}
 }
 const frame=document.querySelector('#cv-feed'),expanded=document.querySelector('#cv-feed>.cv-pin.is-work-expanded');if(frame&&expanded){const ratio=expanded.getBoundingClientRect().width/Math.max(1,frame.getBoundingClientRect().width);mark('Expanded artwork occupies nearly full feed width',ratio>=.85,'ratio='+ratio.toFixed(2)+' frame='+getComputedStyle(frame).display+' cols='+getComputedStyle(frame).gridTemplateColumns.slice(0,90)+' col='+getComputedStyle(expanded).gridColumn+' expanded='+expanded.className+' style='+expanded.getAttribute('style'))}
 const viewport=document.documentElement.clientWidth,overflow=document.documentElement.scrollWidth-viewport;mark('No horizontal overflow',overflow<=3,'overflow='+overflow);
}catch(e){mark('Unexpected page error',false,e?.message||String(e))}
 const r=document.createElement('pre');r.id='cv3-qa-public-result';r.dataset.success=String(tests.every(x=>x.pass));r.textContent=JSON.stringify({passed:tests.filter(x=>x.pass).length,total:tests.length,tests});document.body.append(r);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();})();
