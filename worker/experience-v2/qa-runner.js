/* Headless staging-only QA. Exercises mock API records, never production writes. */
(()=>{'use strict';
const tests=[];const pass=(name,ok,details)=>tests.push({name,pass:!!ok,...(details?{details:String(details).slice(0,150)}:{})});
const wait=async(get,ms=6000)=>{const start=Date.now();while(Date.now()-start<ms){const value=get();if(value)return value;await new Promise(r=>setTimeout(r,70))}return null};
const poll=(selector)=>document.querySelector(selector);
const sampleFile=()=>{
 const input=poll('#cv-workspace input[type=file]');if(!input)return false;
 const data=new DataTransfer();data.items.add(new File(['hello'], 'reference.pdf',{type:'application/pdf'}));input.files=data.files;input.dispatchEvent(new Event('change',{bubbles:true}));
 return poll('.cvfix-file-caption')?.textContent?.includes('reference.pdf');
};
const observeNative=()=>{const root=poll('#cv-workspace');
 root.addEventListener('click',e=>{const btn=e.target.closest('[data-ws-task]');if(btn)window.__cvQAOpenedTask=btn.dataset.wsTask},true);
 document.addEventListener('click',e=>{const btn=e.target.closest('#cv-work-detail .cv-related [data-open]');if(btn)window.__cvQAOpenedArt=btn.dataset.open});
};
async function run(){
try{
 observeNative();
 await wait(()=>window.__cvExperienceV2?.loaded,3000);
 pass('Enhancement initialized',window.__cvExperienceV2?.loaded===true);
 const chip=poll('.cv-profile-chip'),name=chip?.querySelector('span:last-child');const rect=chip?.getBoundingClientRect(),nameRect=name?.getBoundingClientRect();
 pass('Avatar-only chip',!!rect&&rect.width<=50&&!!nameRect&&nameRect.width<=2,(rect?.width||0)+'px chip, name width '+(nameRect?.width||0));
 pass('Account accessible label',chip?.getAttribute('aria-label')?.includes('Keiffer'));
 const sourceClick=poll('#cv-work-detail .cv-related [data-open]');sourceClick?.click();pass('Native artwork click remains intact',window.__cvQAOpenedArt==='work-2');
 const input=poll('#cv-ws-search'),button=poll('[data-ws-ai-search]');if(input)input.value='what are my tasks';
 button?.click();
 const card=await wait(()=>poll('.cvfix-task'),4500);
 pass('Structured AI task card is rendered',!!card,poll('#cv-ws-search-results')?.textContent?.slice(0,120));
 pass('My tasks filtered to owner',document.querySelectorAll('.cvfix-task').length===1);
 pass('Card includes real status and person avatar',!!poll('.cvfix-task .cvfix-status[data-state=blocked]')&&!!poll('.cvfix-task .cvfix-person'));
 pass('No raw null answer',!poll('#cv-ws-search-results')?.textContent?.includes('null'));
 const open=poll('.cvfix-task-open');open?.click();pass('Open task calls native handler',window.__cvQAOpenedTask==='task-1');
 poll('[data-cvfix-mode=team]')?.click();pass('All authorized filter is interactive',document.querySelectorAll('.cvfix-task').length===2);
 poll('[data-cvfix-mode=attention]')?.click();pass('Needs-attention filter is interactive',document.querySelectorAll('.cvfix-task').length===1);
 const mentor=await wait(()=>poll('.cvfix-assignment .cvfix-person'),4500);pass('Assigned ambassador avatar displayed',!!mentor&&mentor.getAttribute('aria-label')?.includes('Luna'));
 pass('Native file selector retains feedback',sampleFile());
 poll('[data-cvfix-close]')?.click();pass('Close task results works',poll('#cv-ws-search-results')?.hidden===true);
 const viewport=document.documentElement.clientWidth,overflow=document.documentElement.scrollWidth-viewport;pass('No horizontal overflow',overflow<=2,'overflow '+overflow+' px');
}catch(err){pass('Unexpected QA error',false,err?.message||String(err))}
 const output=document.createElement('pre');output.id='cv-qa-result';output.dataset.ok=String(tests.every(x=>x.pass));output.dataset.count=String(tests.length);output.textContent=JSON.stringify({passed:tests.filter(x=>x.pass).length,total:tests.length,tests});document.body.append(output);window.__cvQAComplete=true;
 if(new URL(location.href).searchParams.has('preview')){const field=poll('#cv-ws-search'),btn=poll('[data-ws-ai-search]');if(field&&btn){field.value='show all tasks';btn.click();await wait(()=>document.querySelectorAll('.cvfix-task').length===2,3500);}}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>run(),{once:true});else run();
})();
