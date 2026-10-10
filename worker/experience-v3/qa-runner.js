/* Browser-rendering assertions, fixture only. No external writes. */
(()=>{'use strict';const tests=[];
const add=(name,ok,detail='')=>tests.push({name,pass:!!ok,details:String(detail||'').slice(0,200)});
const wait=async(fn,ms=8000)=>{const start=Date.now();while(Date.now()-start<ms){const v=fn();if(v)return v;await new Promise(r=>setTimeout(r,80))}return null};
async function run(){try{
 await wait(()=>window.__cvExperienceV3?.ready,3000);
 add('V3 enhancer initialized',window.__cvExperienceV3?.ready===true);
 const block=await wait(()=>document.querySelector('#cv-work-detail .cv3-work-extra'),5000);
 add('Artwork metadata moved outside two-column hero',!!block&&block.previousElementSibling?.classList.contains('cv-work-layout'));
 add('Original media remains inside layout',!!document.querySelector('#cv-work-detail .cv-work-layout img'));
 add('Source link preserved in full-width area',!!block?.querySelector('a.cv-text-link[href="https://example.org"]'));
 add('Source disclaimer preserved',!!block?.textContent.includes('guide prices'));
 add('Tags preserved',block?.querySelectorAll('.cv3-work-tags>*').length===8);
 const more=block?.querySelector('.cv3-tags-more');add('Long tag list collapsible',!!more);more?.click();add('Tag expansion working',more?.getAttribute('aria-expanded')==='true'&&!!block?.querySelector('.cv3-tags-expanded'));
 const count=await wait(()=>document.querySelectorAll('.cv3-focus-item').length>=3,7000);
 add('Live-source focus board renders authorized tasks and requests',!!count);
 add('Focus cards retain native task ids',!!document.querySelector('.cv3-focus-item [data-ws-task="task-1"]'));
 add('Focus cards retain native request ids',!!document.querySelector('.cv3-focus-item [data-ws-request="request-1"]'));
 add('Workspace Overview relabeled Focus',document.querySelector('[data-ws-tab=overview]')?.textContent==='Focus');
 const owner=await wait(()=>document.querySelector('.cv3-person-picker'),7000);
 add('Owner dropdown replaced by avatar radio choices',!!owner&&!!owner.querySelectorAll('button[role=radio]').length);
 const chosen=owner?.querySelector('[data-cv3-person-id=luna]');chosen?.click();add('Avatar selection updates existing form control',document.querySelector('#cv-ws-task-form select[name=owner_id]')?.value==='luna');
 const mentions=await wait(()=>document.querySelector('#cv-ws-comment-form .cv3-mention-picker, #cv-ws-dialog .cv3-mention-picker'),7000);
 add('Notify people renders as circles',!!mentions&&mentions.querySelectorAll('.cv3-mention-choice .cv3-person-circle').length===5);
 const lunaTip=mentions?.querySelector('[data-cv3-person-id=luna] .cv3-person-circle')?.dataset.cv3Tooltip;
 add('Notify circle tooltip is the person name',lunaTip==='Luna',lunaTip||'');
 const notifyHaseeb=mentions?.querySelector('[data-cv3-person-id=haseeb]');const notifyLuna=mentions?.querySelector('[data-cv3-person-id=luna]');
 notifyHaseeb?.click();notifyLuna?.click();
 const picked=[...document.querySelectorAll('#cv-ws-comment-form select[name=mentions] option:checked')].map(o=>o.value);
 add('Several people can stay selected together',picked.includes('haseeb')&&picked.includes('luna')&&picked.length===2,picked.join(','));
 add('Selected circles stay pressed',notifyHaseeb?.getAttribute('aria-pressed')==='true'&&notifyLuna?.getAttribute('aria-pressed')==='true');
 notifyHaseeb?.click();
 const cleared=[...document.querySelectorAll('#cv-ws-comment-form select[name=mentions] option:checked')].map(o=>o.value);
 add('Clearing one person leaves the others selected',!cleared.includes('haseeb')&&cleared.includes('luna')&&cleared.length===1,cleared.join(','));
 add('Mention values stay on the original select',new FormData(document.querySelector('#cv-ws-comment-form')).getAll('mentions').join(',')==='luna');
 add('Native owner selector remains serialized',!!document.querySelector('#cv-ws-task-form select[name=owner_id]')?.getAttribute('name'));
 const kind=await wait(()=>document.querySelector('.cv3-kind-grid'),7000);add('Request kind visual tiles',!!kind&&kind.querySelectorAll('[role=radio]').length===11);
 kind?.querySelector('[data-cv3-kind=subscription]')?.click();add('Request tile updates original select',document.querySelector('#cv-ws-request-form select[name=kind]')?.value==='subscription');
 const route=await wait(()=>document.querySelector('.cv3-timeline-person'),7000);add('Server-policy preview shows real reviewer identities',!!route&&document.querySelectorAll('.cv3-timeline-person').length===2);
 add('Original request submit button preserved',!!document.querySelector('#cv-ws-request-form button[type=submit]'));
 add('Task actions are review before save',document.querySelector('.cv3-task-actions')?.textContent.includes('Ready to save')===false);
 const member=document.querySelector('.cv3-avatar-group');add('Multi-person selector preserves checkbox controls',!!member&&member.querySelectorAll('input[name=members]').length===4);
 const width=document.documentElement.clientWidth,overflow=document.documentElement.scrollWidth-width;add('No horizontal overflow',overflow<=3,'overflow='+overflow+' width='+width);
}catch(e){add('Unhandled runtime exception',false,String(e?.message||e))}
 const pre=document.createElement('pre');pre.id='cv3-qa-result';pre.dataset.success=String(tests.every(t=>t.pass));pre.textContent=JSON.stringify({passed:tests.filter(x=>x.pass).length,total:tests.length,tests});document.body.append(pre);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();})();
