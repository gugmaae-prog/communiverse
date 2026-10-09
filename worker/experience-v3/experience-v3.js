/* Communiverse V3: additive, source-grounded UX enhancements.
 * Works with the unchanged marketplace and V2 task renderer. No writes here.
 * Every request action remains on the original permission-enforcing endpoint.
 */
(()=>{'use strict';
if(window.__cvExperienceV3)return;
const RELEASE='20261009-v3';window.__cvExperienceV3={release:RELEASE,ready:true};
const ROOT='/communiverse/';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const safe=v=>typeof v==='string'?v.trim():'';
const escapeText=(v,n=250)=>safe(v).slice(0,n);
const validID=v=>/^[A-Za-z0-9_-]{1,128}$/.test(safe(v));
const node=(name,cls,text)=>{const e=document.createElement(name);if(cls)e.className=cls;if(text!==undefined)e.textContent=escapeText(String(text),1500);return e};
const roles={ceo:'CEO',operations:'Operations',ambassador:'Ambassador','ambassador-lead':'Ambassador lead',ai:'AI & artist programme',brand:'Brand',platform:'Platform',latam:'LatAm'};
const labels={blocked:'Blocked',review:'In review',todo:'To do',doing:'In progress',done:'Completed'};
const avatarURL=p=>{const photo=safe(p?.photo||p?.photo_url);if(photo.startsWith(ROOT))return photo;const slug=safe(p?.profile_slug);return validID(slug)?ROOT+'_public/avatar/'+encodeURIComponent(slug):''};
let teamData=null,teamPending=null,teamExpiry=0;
async function authorizedOverview(){if(teamData&&Date.now()<teamExpiry)return teamData;if(teamPending)return teamPending;
 teamPending=(async()=>{const res=await fetch(ROOT+'api/workspace/overview',{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});if(!res.ok)throw Error('Workspace authorization required');const data=await res.json();if(!Array.isArray(data.team)||!Array.isArray(data.tasks)||!Array.isArray(data.projects))throw Error('Workspace response unavailable');teamData=data;teamExpiry=Date.now()+35000;return data;})().finally(()=>{teamPending=null});return teamPending;
}
function personInfo(id,data){if(!validID(id))return {id:'',name:'Unassigned'};return data?.team?.find(p=>p.id===id)||data?.person?.id===id&&data.person||{id,name:id};}
function circle(person,{relationship='',small=false}={}){
 const name=escapeText(person?.name||person?.id||'Unassigned',120),wrap=node('span','cv3-person-circle'+(small?' cv3-person-circle-sm':''));
 wrap.dataset.cv3Tooltip=name+(relationship?' · '+relationship:'');wrap.title=wrap.dataset.cv3Tooltip;wrap.setAttribute('aria-label',wrap.dataset.cv3Tooltip);
 wrap.append(node('span','cv3-person-initial',name.slice(0,1).toUpperCase()));
 const url=avatarURL(person);
 if(url){const img=node('img');img.src=url;img.alt='';img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>img.remove(),{once:true});wrap.append(img)}
 return wrap;
}
function ensureArtwork(){
 const host=$('#cv-work-detail'),layout=host?.querySelector('.cv-work-layout');if(!host||!layout||host.hidden||!layout.parentNode)return;
 if(!layout.querySelector('h2')||!layout.querySelector('img,video'))return;
 if(layout.dataset.cv3Reflow==='yes')return;
 const columns=[...layout.children].filter(x=>x.tagName==='DIV');if(columns.length<2)return;
 const right=columns[1];const extra=node('section','cv3-work-extra');extra.setAttribute('aria-label','Credits and more details');
 const title=node('h3','cv3-section-title','About this work');extra.append(title);
 const source=right.querySelector('a.cv-text-link[href]');const disclaimer=right.querySelector('p.cv-muted');const tagList=right.querySelector('.cv-work-tags');
 const about=node('div','cv3-work-extra-inner');
 const sourceBox=node('div','cv3-source-group');if(source)sourceBox.append(source);if(disclaimer)sourceBox.append(disclaimer);
 if(sourceBox.children.length)about.append(sourceBox);
 if(tagList){const tags=[...tagList.children];const chips=node('div','cv3-work-tags');chips.setAttribute('aria-label','Artwork tags');for(const tag of tags)chips.append(tag);if(chips.children.length>6){for(const tag of [...chips.children].slice(6))tag.classList.add('cv3-tag-overflow');const more=node('button','cv3-quiet-button cv3-tags-more','Show all '+chips.children.length+' tags');more.type='button';more.setAttribute('aria-expanded','false');more.addEventListener('click',()=>{const expanded=more.getAttribute('aria-expanded')!=='true';more.setAttribute('aria-expanded',String(expanded));chips.classList.toggle('cv3-tags-expanded',expanded);more.textContent=expanded?'Show fewer tags':'Show all '+chips.children.length+' tags'});const row=node('div','cv3-tags-group');row.append(chips,more);about.append(row)}else about.append(chips);tagList.remove()}
 if(about.children.length){extra.append(about);layout.insertAdjacentElement('afterend',extra)}
 layout.dataset.cv3Reflow='yes';host.classList.add('cv3-artwork-ready');
 // Existing native gallery listeners own links, likes, video and related navigation.
 // Only compensate for sticky navigation if the expanded panel is obscured.
 if(host.dataset.inline==='true'){
  const panel=host.closest('.cv-pin.is-work-expanded');const sticky=$('#cv-social-header');
  if(panel&&sticky){const bounds=panel.getBoundingClientRect(),minY=sticky.getBoundingClientRect().height+18;if(bounds.top<minY&&bounds.bottom>minY){panel.style.scrollMarginTop=minY+'px';requestAnimationFrame(()=>panel.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}))}}
 }
}
function eligibleFromSelect(select,overview){return [...select.options].filter(opt=>opt.value&& !opt.disabled).map(opt=>({id:opt.value,label:opt.textContent.trim(),person:personInfo(opt.value,overview)}));}
function updatePickerValue(picker,select,options){
 const value=select.value;for(const button of picker.querySelectorAll('[data-cv3-person-id]')){const on=button.dataset.cv3PersonId===value;button.setAttribute('aria-checked',String(on));button.classList.toggle('is-selected',on)}
 if(picker.querySelector('.cv3-picker-count'))picker.querySelector('.cv3-picker-count').textContent=options.length+' eligible';
}
function createPersonPicker(select,overview){
 if(select.dataset.cv3Picker||select.multiple)return;
 const options=eligibleFromSelect(select,overview);if(!options.length)return;
 const root=node('div','cv3-person-picker');root.setAttribute('role','radiogroup');root.setAttribute('aria-label',select.closest('label')?.childNodes[0]?.textContent?.trim()||'Select responsible person');
 const header=node('div','cv3-person-picker-header');header.append(node('span','cv3-label','Choose a person'),node('span','cv3-picker-count',options.length+' eligible'));root.append(header);
 let search=null;if(options.length>8){search=node('input','cv3-picker-search');search.type='search';search.placeholder='Find a person';search.setAttribute('aria-label','Filter people');root.append(search)}
 const grid=node('div','cv3-person-grid');for(const item of options){const b=node('button','cv3-person-choice');b.type='button';b.dataset.cv3PersonId=item.id;b.setAttribute('role','radio');b.title=item.label;b.append(circle(item.person,{relationship:roles[item.person.role]||item.label}));b.append(node('span','cv3-person-name',item.person.name||item.label));if(item.person.role)b.append(node('small','cv3-person-role',roles[item.person.role]||item.person.role));
 b.addEventListener('click',()=>{select.value=item.id;select.dispatchEvent(new Event('change',{bubbles:true}));updatePickerValue(root,select,options)});grid.append(b)}root.append(grid);
 if(search)search.addEventListener('input',()=>{const q=search.value.trim().toLocaleLowerCase();for(const btn of grid.children)btn.hidden=!!q&&!btn.textContent.toLocaleLowerCase().includes(q)});
 select.dataset.cv3Picker='yes';select.classList.add('cv3-native-hidden');select.setAttribute('aria-hidden','true');select.tabIndex=-1;
 select.insertAdjacentElement('afterend',root);select.addEventListener('change',()=>updatePickerValue(root,select,options));updatePickerValue(root,select,options);
}
function upgradePersonForms(){
 const select=$('#cv-ws-dialog #cv-ws-task-form select[name=owner_id],#cv-ws-dialog [data-assistant-submit] select[name=owner_id]');if(select&&!select.dataset.cv3Picker){authorizedOverview().then(d=>{if(select.isConnected)createPersonPicker(select,d)}).catch(()=>{})}
 // Project collaborators and Connect participant selectors are already permission-limited
 // checkboxes; retain native controls, restyle as avatar tiles and allow searching.
 for(const fieldset of $$('#cv-ws-dialog .cv-ws-members,#cv-ws-dialog fieldset:has(input[name=members]),#cv-ws-dialog fieldset:has(input[name=participants])')){
   if(fieldset.dataset.cv3Group)return;fieldset.dataset.cv3Group='yes';fieldset.classList.add('cv3-avatar-group');
   const labels=[...fieldset.querySelectorAll('label')];
   if(labels.length>8){const filter=node('input','cv3-picker-search');filter.type='search';filter.placeholder='Find people';filter.setAttribute('aria-label','Search eligible people');fieldset.insertBefore(filter,fieldset.querySelector('legend')?.nextSibling||fieldset.firstChild);filter.addEventListener('input',()=>{const q=filter.value.toLocaleLowerCase().trim();for(const x of labels)x.hidden=!!q&&!x.textContent.toLocaleLowerCase().includes(q)})}
   authorizedOverview().then(d=>{if(!fieldset.isConnected)return;for(const label of labels){const input=label.querySelector('input[type=checkbox]');if(!input)continue;const person=personInfo(input.value,d);label.dataset.cv3PersonName=person.name||input.value;label.title=person.name||input.value;const prior=label.querySelector('.cv-avatar');if(prior&&prior.querySelector('img'))continue;if(prior){prior.replaceChildren(circle(person,{relationship:person.role||'Team member'}))}else{label.prepend(circle(person,{relationship:person.role||'Team member'}))}}}).catch(()=>{});
 }
}
const kindHints={resource:'General support',asset:'Equipment or an asset',kit:'Camera, tools or supplies',subscription:'Software and renewals',training:'Skills and guidance',access:'Access and permissions',pay:'Compensation review',contract:'Agreement or contract',travel:'Travel support',ambassador:'Ambassador programme',other:'Other support'};
function kindReviewers(overview,kind,amount){const role=overview?.person?.role||'';if(role==='ambassador')return['keiffer','haseeb','elferah'];if(role==='ai'||['pay','contract','ambassador','travel','kit','asset','subscription'].includes(kind)||amount!=='')return['haseeb','elferah'];return['elferah']}
function renderRoute(root,overview,select,amount){const list=kindReviewers(overview,select.value,safe(amount?.value||''));root.replaceChildren();const heading=node('p','cv3-label','Expected approval journey');const chain=node('div','cv3-approval-timeline');chain.setAttribute('aria-label','Expected approval sequence');for(const [i,id] of list.entries()){const info=personInfo(id,overview);const part=node('div','cv3-timeline-person');part.append(circle(info,{relationship:i===0?'First reviewer':'Next stage'}),node('span','',info.name||id));if(i)chain.append(node('span','cv3-timeline-line',''));chain.append(part)}root.append(heading,chain,node('p','cv3-note','The reviewer is determined by Communiverse policy on submission. This preview cannot change permissions.'))}
function upgradeRequestForm(){const form=$('#cv-ws-dialog #cv-ws-request-form');if(!form||form.dataset.cv3Ready)return;const select=form.querySelector('select[name=kind]');if(!select)return;
 form.dataset.cv3Ready='yes';const kinds=[...select.options].filter(x=>x.value).map(x=>({id:x.value,label:x.textContent.trim()}));const root=node('div','cv3-kind-selector');root.setAttribute('role','radiogroup');root.setAttribute('aria-label','Type of request');root.append(node('p','cv3-label','What do you need?'));
 const grid=node('div','cv3-kind-grid');for(const kind of kinds){const b=node('button','cv3-kind-tile');b.type='button';b.dataset.cv3Kind=kind.id;b.setAttribute('role','radio');b.append(node('strong','',kind.label),node('small','',kindHints[kind.id]||''));b.addEventListener('click',()=>{select.value=kind.id;select.dispatchEvent(new Event('change',{bubbles:true}));refresh()});grid.append(b)}root.append(grid);
 select.classList.add('cv3-native-hidden');select.tabIndex=-1;select.setAttribute('aria-hidden','true');select.insertAdjacentElement('afterend',root);
 const route=node('div','cv3-route-preview');form.insertBefore(route,form.querySelector('button.cv-button')||form.lastChild);
 const amount=form.querySelector('input[name=amount]');let overview=null;
 function refresh(){for(const x of grid.children)x.setAttribute('aria-checked',String(x.dataset.cv3Kind===select.value));if(overview)renderRoute(route,overview,select,amount);else route.textContent='Checking your approval path…'}
 select.addEventListener('change',refresh);amount?.addEventListener('input',refresh);
 authorizedOverview().then(data=>{overview=data;if(form.isConnected)refresh()}).catch(()=>{route.textContent='The approval path will be confirmed when you submit.'});refresh();
}
function upgradeTaskForm(){const form=$('#cv-ws-dialog #cv-ws-task-form');if(!form||form.dataset.cv3Action)return;form.dataset.cv3Action='yes';const state=form.querySelector('select[name=status]');if(!state)return;const title=form.querySelector('input[name=title]')?.value||'Task';const prior=node('section','cv3-task-actions');prior.append(node('p','cv3-label','Next useful step'));
 const row=node('div','cv3-inline-actions');const current=state.value;
 function suggested(label,value){const button=node('button','cv3-quiet-button',label);button.type='button';button.addEventListener('click',()=>{if(value&&![...state.options].some(o=>o.value===value&&!o.disabled))return;if(value){state.value=value;state.dispatchEvent(new Event('change',{bubbles:true}));note.textContent='Ready to save. Review the details below, then select Save task.'}else note.textContent='You can create a support request without changing this task.'});return button}
 if(!state.disabled&&current==='todo')row.append(suggested('Start this task','doing'));
 if(!state.disabled&&current==='blocked')row.append(suggested('Mark ready for review','review'));
 if(!state.disabled&&current==='doing')row.append(suggested('Send for review','review'));
 if(current==='review')row.append(suggested('Review details',null));
 if(current==='done')row.append(suggested('View outcome',null));
 if(!row.children.length)row.append(node('span','cv3-note','Open the task details and check the latest information.'));
 const note=node('p','cv3-note','Actions are staged locally until you save; no updates are sent automatically.');prior.append(row,note);form.parentElement?.insertBefore(prior,form);
}
function upgradeFocus(){const content=$('#cv-ws-content'),app=$('#cv-ws-app');if(!content||!app||app.hidden)return;
 const active=$('.cv-ws-tabs [data-ws-tab=overview][aria-pressed=true]');if(!active||content.querySelector('.cv3-focus-board'))return;
 authorizedOverview().then(data=>{if(!content.isConnected||!$('.cv-ws-tabs [data-ws-tab=overview][aria-pressed=true]')||content.querySelector('.cv3-focus-board'))return;
 const items=data.tasks.filter(t=>['blocked','review','todo','doing'].includes(t.status));items.sort((a,b)=>({blocked:0,review:1,doing:2,todo:3}[a.status]??5)-({blocked:0,review:1,doing:2,todo:3}[b.status]??5)||String(a.due_date||'9999').localeCompare(String(b.due_date||'9999')));
 const approvals=data.requests.filter(r=>r.reviewer_id===data.person?.id&&['keiffer','approval','operations','needs-info'].includes(r.stage));const panel=node('section','cv3-focus-board');panel.append(node('p','cv3-kicker','YOUR FOCUS'));
 const top=node('div','cv3-focus-head');top.append(node('h2','','What needs attention'));top.append(node('p','cv3-note',items.filter(x=>x.status==='blocked').length+' blocked · '+items.filter(x=>x.status==='review').length+' under review · '+approvals.length+' approvals waiting with you'));panel.append(top);
 const grid=node('div','cv3-focus-grid');const projects=new Map(data.projects.map(x=>[x.id,x]));
 for(const t of items.slice(0,5)){const card=node('article','cv3-focus-item');const top=node('div','cv3-card-top');top.append(node('span','cv3-state cv3-state-'+t.status,labels[t.status]||t.status));top.append(node('small','cv3-project',projects.get(t.project_id)?.title||'Project'));card.append(top,node('h3','',t.title||'Task'));
 const line=node('div','cv3-card-bottom');const owner=personInfo(t.owner_id,data);line.append(circle(owner,{relationship:'Task owner',small:true}),node('span','cv3-note',owner.name||'Unassigned'));
 const open=node('button','cv3-action',t.status==='blocked'?'Resolve blocker':t.status==='review'?'Open review':'Open task');open.type='button';open.dataset.wsTask=t.id;open.title='Open task: '+t.title;line.append(open);card.append(line);grid.append(card)}
 for(const req of approvals.slice(0,2)){const card=node('article','cv3-focus-item cv3-focus-request');card.append(node('span','cv3-state','Your decision'),node('h3','',req.title||'Request'));const line=node('div','cv3-card-bottom');line.append(circle(personInfo(req.created_by,data),{relationship:'Requester',small:true}));const open=node('button','cv3-action','Review request');open.type='button';open.dataset.wsRequest=req.id;line.append(open);card.append(line);grid.append(card)}
 if(!grid.children.length)grid.append(node('p','cv3-note','Your work is up to date. New priorities will appear here.'));
 panel.append(grid);content.insertAdjacentElement('afterbegin',panel);
 }).catch(()=>{});
}
function upgradeWorkspaceLabels(){const nav=$('.cv-ws-tabs');if(nav&&!nav.dataset.cv3Nav){nav.dataset.cv3Nav='yes';for(const [id,text] of [['overview','Focus'],['projects','Work'],['team','People']]){const item=nav.querySelector('[data-ws-tab='+id+']');if(item)item.textContent=text}}
}
function updateFileUI(){for(const input of $$('.cv-workspace input[type=file]')){if(input.dataset.cv3File)return;input.dataset.cv3File='yes';const form=input.closest('form');if(!form)return;form.classList.add('cv3-upload-form');const caption=form.querySelector('.cvfix-file-caption');if(caption)caption.textContent='Choose a reference · 20 MB images/documents or 32 MB video';}}
function run(){try{ensureArtwork();upgradeWorkspaceLabels();upgradePersonForms();upgradeRequestForm();upgradeTaskForm();upgradeFocus();updateFileUI()}catch(e){console.warn('Communiverse presentation enhancement',e?.message||e)}}
let scheduled=0;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=requestAnimationFrame(()=>{scheduled=0;run()})});
function boot(){run();observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
