/* V3 homepage compact reader + related pins regression suite.
 * Runs only in an isolated Cloudflare Browser Rendering staging page.
 * Reads public catalog data and opens work; does not submit writes.
 */
(()=>{'use strict';
const tests=[];
const pass=(name,ok,detail='')=>tests.push({name,pass:!!ok,detail:String(detail).slice(0,230)});
const sleep=t=>new Promise(r=>setTimeout(r,t));
async function wait(fn,timeout=12000){const start=Date.now();do{const result=fn();if(result)return result;await sleep(100)}while(Date.now()-start<timeout);return null}
const rect=n=>n?.getBoundingClientRect();
const hasOverlap=(a,b)=>a.left<b.right-2&&b.left<a.right-2&&a.top<b.bottom-2&&b.top<a.bottom-2;
async function main(){
 const widths={viewport:document.documentElement.clientWidth};
 try{
 pass('V3 and V2 scripts initialized',!!window.__cvExperienceV3?.ready&&!!window.__cvExperienceV2?.loaded);
 pass('Navigation retained',!!document.querySelector('#cv-social-header nav'));
 const feed=await wait(()=>document.querySelector('#cv-feed.cv-masonry.cv-laid-out'),10000);
 pass('Real gallery feed loaded',!!feed);
 const tile=await wait(()=>document.querySelector('#cv-feed>.cv-pin .cv-pin-media[data-open]'),7000);
 pass('Artwork card click target exists',!!tile);
 if(tile){
  const before=rect(tile).width,id=tile.dataset.open;
  tile.click();
  const heading=await wait(()=>document.querySelector('#cv-work-detail .cv-work-layout h2'),11500);
  pass('Native click opens expanded work',!!heading);
  pass('Deep link records selected work',new URL(location.href).searchParams.get('work')===id);
  await wait(()=>document.querySelector('#cv-work-detail .cv3-work-extra'),5000);
  await sleep(220);
  const expanded=document.querySelector('#cv-feed>.cv-pin.is-work-expanded');
  const panel=rect(expanded),outer=rect(feed),ratio=panel&&outer?panel.width/outer.width:0;
  widths.feedColumns=feed?getComputedStyle(feed).gridTemplateColumns.split(' ').filter(Boolean).length:0;
  widths.panelRatio=+ratio.toFixed(3);
  widths.gridColumn=expanded?getComputedStyle(expanded).gridColumn:'none';
  const vp=widths.viewport;
  pass('Expanded work stays inline',!!expanded&&!document.querySelector('#cv-work-dialog')?.open);
  pass('Three-column maximum on five-column desktop',vp<1200||widths.feedColumns!==5||(ratio>.42&&ratio<.72),ratio.toFixed(3));
  pass('Reader maximum 2–3 columns at tablet/desktop',vp<701||vp>=1200||(ratio>.28&&ratio<.84),ratio.toFixed(3));
  pass('Mobile selected reader fills its available width',vp>700||ratio>.87,ratio.toFixed(3));
  const bigMedia=document.querySelector('#cv-work-detail .cv-work-layout>div:first-child>img,#cv-work-detail .cv-work-layout>div:first-child>video');
  pass('Expanded artwork media present and enlarged',!!bigMedia&&rect(bigMedia).width>=Math.min(before*1.1,rect(expanded).width*0.49)-5,'media='+rect(bigMedia)?.width+' before='+before);
  pass('Media uses non-cropping object-fit',!!bigMedia&&getComputedStyle(bigMedia).objectFit==='contain');
  const credits=document.querySelector('#cv-work-detail .cv3-work-extra');
  pass('Credits/tags remain below artwork',!!credits&&!!credits.previousElementSibling?.classList.contains('cv-work-layout'));
  const related=await wait(()=>document.querySelector('#cv-work-detail .cv-related.cv-masonry'),5000);
  const cards=related?[...related.children].filter(x=>x.classList.contains('cv-pin')):[];
  pass('Real related work cards render',cards.length>=4,'cards='+cards.length);
  if(related&&cards.length){
    const style=getComputedStyle(related),w=rect(related)?.width||0;
    widths.relatedColumns=style.gridTemplateColumns.split(' ').filter(Boolean).length;
    widths.relatedAutoRows=style.gridAutoRows;
    pass('Recommendations have their own column grid',style.display==='grid'&&widths.relatedColumns===(vp<=360?1:2),'columns='+style.gridTemplateColumns);
    pass('No inherited 8px masonry rows',style.gridAutoRows==='auto','gridAutoRows='+style.gridAutoRows);
    pass('Related cards use natural rows',cards.every(x=>getComputedStyle(x).gridRowEnd==='auto'));
    const overlaps=[];for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){if(hasOverlap(rect(cards[i]),rect(cards[j])))overlaps.push(i+'-'+j)}
    pass('Suggested work cards do not overlap',overlaps.length===0,overlaps.slice(0,5).join(','));
    pass('All suggested cards stay inside expanded panel',cards.every(c=>rect(c).left>=rect(related).left-3&&rect(c).right<=rect(related).right+3));
    const thumbs=cards.map(c=>c.querySelector('.cv-pin-media')).filter(Boolean);
    pass('Every suggestion has a proportional media frame',thumbs.length===cards.length&&thumbs.every(x=>getComputedStyle(x).aspectRatio==='4 / 5'&&getComputedStyle(x).overflow==='hidden'));
    const heights=thumbs.map(x=>rect(x).height);
    pass('Recommendation frames align per row',heights.length===0||Math.max(...heights)-Math.min(...heights)<4,'heights='+heights.slice(0,5).map(x=>x.toFixed(1)).join(','));
    pass('Suggested images are not cropped',thumbs.every(x=>{const m=x.querySelector('img,video');return !m||getComputedStyle(m).objectFit==='contain'}));
    pass('Artist labels remain in recommendations',cards.every(x=>!!x.querySelector('.cv-pin-caption a[href]')));
    pass('Artwork names have intact links',cards.every(x=>!!x.querySelector('.cv-pin-caption [data-open]')));
    pass('No recommendation horizontal overflow',related.scrollWidth<=related.clientWidth+3,'width='+w+',overflow='+(related.scrollWidth-related.clientWidth));
    const target=cards[0]?.querySelector('[data-open]');
    const nextId=target?.dataset.open;
    const oldTitle=heading?.textContent;
    target?.click();
    const newHeading=await wait(()=>document.querySelector('#cv-work-detail .cv-work-layout h2')?.textContent!==oldTitle?document.querySelector('#cv-work-detail .cv-work-layout h2'):null,11500);
    pass('Related-work selection opens a different work',!!newHeading,'next='+nextId);
    pass('Related-work URL updates',new URL(location.href).searchParams.get('work')===nextId);
    await sleep(300);
    const stale=[...document.querySelectorAll('#cv-feed>.cv-pin.is-work-expanded')].filter(x=>x.dataset.id!==nextId);
    pass('Old selected artwork does not remain expanded',stale.length===0,'stale='+stale.map(x=>x.dataset.id));
  }
  pass('No sideways scroll after interactions',document.documentElement.scrollWidth<=document.documentElement.clientWidth+3,'overflow='+(document.documentElement.scrollWidth-document.documentElement.clientWidth));
 }
 }catch(err){pass('Unexpected error',false,err?.message||String(err))}
 const report=document.createElement('pre');report.id='cvcompact-qa-result';report.dataset.success=String(tests.every(x=>x.pass));report.textContent=JSON.stringify({passed:tests.filter(t=>t.pass).length,total:tests.length,widths,tests});document.body.append(report);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',main,{once:true});else main();
})();