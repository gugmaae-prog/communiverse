/* Read-only staging smoke checks against the real public Communiverse runtime. */
(()=>{'use strict';
const results=[],mark=(n,ok,details)=>results.push({name:n,pass:!!ok,...(details?{details:String(details).slice(0,120)}:{})});
const wait=async(cb,time=9000)=>{const start=Date.now();while(Date.now()-start<time){const o=cb();if(o)return o;await new Promise(r=>setTimeout(r,130))}return null};
async function run(){
 try{
  const app=await wait(()=>document.querySelector('#cv-feed'),6000);
  mark('Real public art feed renders',!!app);
  mark('New script initialized',window.__cvExperienceV2?.loaded===true);
  mark('Communiverse header intact',!!document.querySelector('#cv-social-header nav[aria-label="Main navigation"]'));
  mark('Artwork tiles present',document.querySelectorAll('#cv-feed>.cv-pin[data-id]').length>=5);
  const viewport=document.documentElement.clientWidth;
  mark('No horizontal overflow initially',document.documentElement.scrollWidth<=viewport+3,'width='+document.documentElement.scrollWidth+' viewport='+viewport);
  const btn=await wait(()=>document.querySelector('#cv-feed>.cv-pin [data-open]'),3000);
  if(btn){
   const first=btn.dataset.open;btn.click();
   const main=await wait(()=>document.querySelector('#cv-work-detail .cv-work-layout h2'),9000);
   mark('Native work-detail click displays content',!!main);
   mark('Expanded work preserves known ID',new URL(location.href).searchParams.get('work')===first);
   mark('Main artwork remains present',!!document.querySelector('#cv-work-detail .cv-work-layout img,#cv-work-detail .cv-work-layout video'));
   const related=await wait(()=>document.querySelector('#cv-work-detail .cv-related [data-open]'),5000);
   mark('Related works render with real buttons',!!related);
   if(related){
    const target=related.dataset.open,previous=document.querySelector('#cv-work-detail .cv-work-layout h2')?.textContent;
    related.click();
    const changed=await wait(()=>document.querySelector('#cv-work-detail .cv-work-layout h2')?.textContent!==previous?document.querySelector('#cv-work-detail .cv-work-layout h2'):null,9500);
    mark('Related-work click switches to another artwork',!!changed,'target='+target);
    mark('Related-work route ID matches clicked item',new URL(location.href).searchParams.get('work')===target);
    await new Promise(resolve=>setTimeout(resolve,280));
    const oldExpanded=document.querySelectorAll('#cv-feed>.is-work-expanded').length;
    mark('Transition clears outdated expanded card',oldExpanded===0,'remaining='+oldExpanded+' trace='+JSON.stringify(window.__cvExperienceV2?.lastRecommendation||{}));
   }
  }else mark('Gallery click target available',false);
  mark('No horizontal overflow after detail',document.documentElement.scrollWidth<=document.documentElement.clientWidth+3,'overflow='+String(document.documentElement.scrollWidth-document.documentElement.clientWidth));
 }catch(e){mark('Staging runner error',false,e?.message||String(e))}
 const r=document.createElement('pre');r.id='cv-qa-public-result';r.dataset.ok=String(results.every(x=>x.pass));r.dataset.count=String(results.length);r.textContent=JSON.stringify({passed:results.filter(x=>x.pass).length,total:results.length,tests:results});document.body.append(r);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
