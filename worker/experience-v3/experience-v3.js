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
function settleTaskFields(){const form=$('#cv-ws-dialog #cv-ws-task-form');if(!form||form.dataset.cv3Fields)return;
 const status=form.querySelector('select[name=status]')?.closest('label');
 const priority=form.querySelector('select[name=priority]')?.closest('label');
 const due=form.querySelector('input[name=due_date]')?.closest('label');
 if(!status||!priority||!due)return;
 const band=node('div','cv3-task-fields');
 const ownerRow=form.querySelector('select[name=owner_id]')?.closest('.cv-form-row');
 (ownerRow||status).insertAdjacentElement('afterend',band);
 band.append(status,priority,due);
 for(const row of [...form.querySelectorAll('.cv-form-row')]){if(!row.querySelector('input,select,textarea,.cv3-person-picker'))row.remove()}
 form.dataset.cv3Fields='yes';
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
function mentionRoot(select){const anchor=select.closest('label')||select;const root=anchor.nextElementSibling;return root?.classList.contains('cv3-mention-picker')?root:null}
function personForMention(opt,overview){const info=personInfo(opt.value,overview);const label=opt.textContent.trim();const name=info.name&&info.name!==info.id?info.name:label;return {...info,id:opt.value,name:name||label||opt.value}}
function syncMentionPicker(picker,select){for(const button of picker.querySelectorAll('[data-cv3-person-id]')){const opt=[...select.options].find(o=>o.value===button.dataset.cv3PersonId);const on=!!opt?.selected;button.setAttribute('aria-pressed',String(on));button.classList.toggle('is-selected',on)}
 const n=[...select.selectedOptions].length;const count=picker.querySelector('.cv3-mention-count');if(count)count.textContent=n===0?'None selected':n===1?'1 person selected':n+' people selected'}
function createMentionPicker(select,overview){if(select.dataset.cv3Mentions==='yes')return;
 const items=[...select.options].filter(opt=>opt.value&&!opt.disabled).map(opt=>({id:opt.value,label:opt.textContent.trim(),person:personForMention(opt,overview)}));
 if(!items.length){delete select.dataset.cv3Mentions;return}
 const root=node('div','cv3-mention-picker');root.setAttribute('role','group');root.setAttribute('aria-label','Notify people');
 let search=null;if(items.length>8){search=node('input','cv3-picker-search');search.type='search';search.placeholder='Find a person';search.setAttribute('aria-label','Filter people to notify');root.append(search)}
 const row=node('div','cv3-mention-row');
 for(const item of items){const b=node('button','cv3-mention-choice');b.type='button';b.dataset.cv3PersonId=item.id;b.setAttribute('aria-pressed','false');b.title=item.person.name||item.label;b.append(circle(item.person,{relationship:''}));b.append(node('span','cv3-person-name',item.person.name||item.label));
  b.addEventListener('click',()=>{const opt=[...select.options].find(o=>o.value===item.id);if(!opt)return;opt.selected=!opt.selected;select.dispatchEvent(new Event('change',{bubbles:true}));syncMentionPicker(root,select)});row.append(b)}
 root.append(row);const count=node('p','cv3-mention-count','');count.setAttribute('aria-live','polite');root.append(count);
 if(search)search.addEventListener('input',()=>{const q=search.value.trim().toLocaleLowerCase();for(const btn of row.children)btn.hidden=!!q&&!btn.textContent.toLocaleLowerCase().includes(q)});
 select.dataset.cv3Mentions='yes';select.classList.add('cv3-native-hidden');select.setAttribute('aria-hidden','true');select.tabIndex=-1;
 (select.closest('label')||select).insertAdjacentElement('afterend',root);select.addEventListener('change',()=>syncMentionPicker(root,select));syncMentionPicker(root,select);
}
function refreshMentionFaces(select,overview){const picker=mentionRoot(select);if(!picker)return;for(const button of picker.querySelectorAll('[data-cv3-person-id]')){const opt=[...select.options].find(o=>o.value===button.dataset.cv3PersonId);if(!opt)continue;const person=personForMention(opt,overview);const face=button.querySelector('.cv3-person-circle');const name=button.querySelector('.cv3-person-name');if(name)name.textContent=person.name;button.title=person.name;if(face)face.replaceWith(circle(person,{relationship:''}))}}
function upgradeMentionSelects(){for(const select of $$('#cv-ws-dialog #cv-ws-comment-form select[name=mentions][multiple]')){if(select.dataset.cv3Mentions==='yes'||select.dataset.cv3Mentions==='pending')continue;select.dataset.cv3Mentions='pending';
 const paint=data=>{if(select.isConnected&&select.dataset.cv3Mentions!=='yes')createMentionPicker(select,data)};
 paint(teamData||{team:[]});
 authorizedOverview().then(data=>{if(!select.isConnected)return;if(select.dataset.cv3Mentions==='yes')refreshMentionFaces(select,data);else paint(data)}).catch(()=>{if(select.isConnected&&select.dataset.cv3Mentions!=='yes')paint({team:[]})});
}}
const planWords=new Set(['plan','this','that','with','from','your','have','need','trip','days','what','mind','want','please','make','into','about']);
function planKind(prompt){const q=prompt.toLowerCase();if(/\b(camera|kit|gear|equipment|lens)\b/.test(q))return 'kit';if(/\b(trip|travel|flight|itinerary|ambassador)\b/.test(q))return 'travel';if(/\bvisit\b/.test(q))return 'travel';if(/\b(budget|cost|calculate|how much|estimate)\b/.test(q))return 'budget';return 'plan'}
function readDays(prompt){const m=prompt.match(/\b(\d{1,3})\s*days?\b/i);return m?Number(m[1]):null}
function readBudget(prompt){const m=prompt.match(/(?:usd|\$)\s*(\d{1,7}(?:[.,]\d{1,2})?)|\b(\d{1,7}(?:[.,]\d{1,2})?)\s*(?:usd|dollars)\b/i);if(!m)return null;const n=Number(String(m[1]||m[2]).replace(/,/g,''));return Number.isFinite(n)?n:null}
function money(n){const v=Number(n);return Number.isFinite(v)?v.toLocaleString(undefined,{maximumFractionDigits:2}):'0'}
function namedPeople(prompt,overview){const team=overview?.team||[],found=[];for(const p of team){const first=safe(p?.name).split(/\s+/)[0];if(first.length<3)continue;if(new RegExp('\\b'+first.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(prompt))found.push(p)}if(found.length)return found;const m=prompt.match(/\bfor\s+([A-Za-z][A-Za-z.'-]{2,})/);return m?[{id:'',name:m[1]}]:[]}
function routePeople(assistant,overview){const team=overview?.team||[];return [...assistant.querySelectorAll('.cv-assistant-route span')].map(s=>s.textContent.replace(/^\s*\d+\.\s*/,'').trim()).filter(Boolean).map(name=>{const person=team.find(p=>safe(p.name).toLowerCase()===name.toLowerCase());return person||{id:'',name}})}
function relatedWork(prompt,overview){const words=prompt.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>3&&!planWords.has(w));return (overview?.tasks||[]).filter(t=>{const blob=[t.title,t.description,t.owner_id,t.created_by].map(v=>safe(v).toLowerCase()).join(' ');return words.some(w=>blob.includes(w))}).slice(0,3)}
function planTitle(prompt,people,kind){const who=people[0]?.name;if(kind==='travel')return who?'Trip plan for '+who:'Trip plan';if(kind==='kit')return who?'Kit plan for '+who:'Kit plan';if(kind==='budget')return 'Cost plan';return who?'Plan with '+who:'A plan from your question'}
function planSteps(kind,prompt,people,related){const who=people.map(p=>p.name).filter(Boolean).join(', ')||'the people you add';if(kind==='travel')return [['Purpose',prompt],['Who travels',who+' is on this draft. Add anyone else who should go.'],['Dates','Set the number of days. The total follows that figure.'],['Money','The budget you named is split across the days and people. Change any figure.'],['Review','The approval circles are the expected reviewers. The draft below is what can be recorded.'],['After approval','Book travel only after the request is approved, then share the outcome with the people on this plan.']];if(kind==='kit')return [['What is needed',prompt],['Who it is for',who],['Already in the workspace',related.length?related.map(t=>t.title).join(', '):'No open task in your workspace mentions this yet.'],['Cost','Put the estimate in the calculator. It copies into the draft amount.'],['Review','Expected reviewers are the circles below. Nothing is requested until the draft is submitted.'],['Hand-off','After approval, name who collects the kit and when it comes back.']];return [['What you asked',prompt],['People',who],['Figures','Use days, people, and a daily allowance. The total stays here until you change it.'],['Recommendations',related.length?'Related workspace records are listed with the plan.':'Recommendations use the records already in your workspace.'],['Next action','Read the answer above. Use the draft only if you want the work recorded.']]}
function upgradeMind(){const assistant=$('#cv-ws-search-results .cv-ws-assistant');if(!assistant||assistant.dataset.cv3Plan==='yes'||assistant.dataset.cv3Plan==='pending')return;if(!assistant.querySelector('.cv-assistant-answer'))return;const prompt=safe($('#cv-ws-search')?.value);if(!prompt)return;assistant.dataset.cv3Plan='pending';
 const paint=data=>{if(!assistant.isConnected||assistant.dataset.cv3Plan==='yes')return;drawMind(assistant,prompt,data)};
 paint(teamData||null);
 authorizedOverview().then(data=>{if(!assistant.isConnected||assistant.querySelector('.cv3-plan')?.dataset.cv3Touched==='yes')return;if(assistant.dataset.cv3PlanSource==='live')return;assistant.dataset.cv3Plan='pending';assistant.querySelector('.cv3-plan')?.remove();drawMind(assistant,prompt,data)}).catch(()=>{});
}
function drawMind(assistant,prompt,overview){const kind=planKind(prompt),travelers=namedPeople(prompt,overview),assumedDays=readDays(prompt)==null,days=readDays(prompt)||(kind==='travel'?3:1),budget=readBudget(prompt),related=relatedWork(prompt,overview);
 const reviewers=routePeople(assistant,overview);const chain=reviewers.length?reviewers:kindReviewers(overview,kind==='kit'?'kit':'travel',budget??'').map(id=>personInfo(id,overview));
 const subject=travelers.length?travelers:(overview?.person?[overview.person]:[]);
 const board=node('section','cv3-plan');board.setAttribute('aria-label','Working plan');board.dataset.cv3Touched='no';
 const head=node('div','cv3-plan-head');head.append(node('p','cv3-kicker',kind==='travel'?'TRIP PLAN':kind==='kit'?'KIT PLAN':kind==='budget'?'COST PLAN':'WORKING PLAN'));head.append(node('h3','',planTitle(prompt,subject,kind)));head.append(node('p','cv3-note','Edit the steps and figures. Nothing is booked or sent from this board.'));board.append(head);
 const peopleBlock=node('div','cv3-plan-people');
 const travelerLabel=node('p','cv3-label',kind==='travel'?'Who is going':'People in this plan');
 const travelerChain=node('div','cv3-plan-chain cv3-plan-travelers');travelerChain.setAttribute('aria-label','People on this plan');
 function link(){return node('span','cv3-plan-link','')}
 function personNode(person,relationship){const item=node('div','cv3-plan-person');item.dataset.cv3PersonId=person.id||person.name;item.append(circle(person,{relationship}),node('span','cv3-person-name',person.name||'Person'),node('small','cv3-person-role',relationship));return item}
 subject.forEach((p,i)=>{if(i)travelerChain.append(link());travelerChain.append(personNode(p,roles[p.role]||(p.role?'Team':'Named in your question')))});
 const add=node('button','cv3-plan-add cv3-plan-add-person','Add someone');add.type='button';
 const picker=node('div','cv3-plan-picker');picker.hidden=true;picker.setAttribute('aria-label','People you can add');
 const team=overview?.team||[];
 for(const p of team){if(!p?.id||travelerChain.querySelector('[data-cv3-person-id="'+CSS.escape(p.id)+'"]'))continue;const b=node('button','cv3-plan-choice');b.type='button';b.dataset.cv3PersonId=p.id;b.append(circle(p,{relationship:roles[p.role]||'Team',small:true}),node('span','cv3-person-name',p.name));b.addEventListener('click',()=>{if(travelerChain.children.length)travelerChain.append(link());travelerChain.append(personNode(p,roles[p.role]||'Added to this plan'));b.remove();picker.hidden=true;if(peopleInput.dataset.cv3Edited!=='yes')peopleInput.value=String(travelerChain.querySelectorAll('.cv3-plan-person').length);board.dataset.cv3Touched='yes';recalc()});picker.append(b)}
 add.addEventListener('click',()=>{board.dataset.cv3Touched='yes';if(!team.length){picker.hidden=false;picker.textContent='Your team list is not available yet.';return}picker.hidden=!picker.hidden});
 peopleBlock.append(travelerLabel,travelerChain,add,picker);
 const reviewLabel=node('p','cv3-label','Expected approval path');
 const reviewChain=node('div','cv3-plan-chain cv3-plan-reviewers');reviewChain.setAttribute('aria-label','Expected reviewers');
 chain.forEach((p,i)=>{if(i)reviewChain.append(link());reviewChain.append(personNode(p,i===0?'First reviewer':'Next reviewer'))});
 const reviewNote=node('p','cv3-note','This path follows the current request policy. Submitting the draft is what asks for review.');
 peopleBlock.append(reviewLabel,reviewChain,reviewNote);board.append(peopleBlock);
 const steps=node('ol','cv3-plan-steps');
 function appendStep(title,detail){const li=node('li','cv3-plan-step');const btn=node('button','cv3-plan-step-btn');btn.type='button';btn.setAttribute('aria-pressed','false');const copy=node('div','cv3-plan-copy');copy.append(node('strong','',title),node('p','',detail));btn.append(node('span','cv3-plan-num',String(steps.children.length+1)),copy);btn.addEventListener('click',()=>{btn.setAttribute('aria-pressed',String(btn.getAttribute('aria-pressed')!=='true'));board.dataset.cv3Touched='yes';syncProgress()});li.append(btn);steps.append(li)}
 for(const [title,detail] of planSteps(kind,prompt,subject,related))appendStep(title,detail);
 const addStep=node('button','cv3-quiet-button cv3-plan-add-step','Add a step');addStep.type='button';addStep.addEventListener('click',()=>{appendStep('New step','Write what should happen here.');board.dataset.cv3Touched='yes';syncProgress()});
 const progress=node('p','cv3-plan-progress','');board.append(steps,addStep,progress);
 const calc=node('div','cv3-plan-calc');calc.setAttribute('aria-label','Working estimate');
 function field(cls,label,value,step){const wrap=node('label','cv3-plan-field',label);const input=node('input');input.className=cls;input.type='number';input.min='0';input.step=step;input.value=value;if(cls.includes('days')||cls.includes('people'))input.min='1';wrap.append(input);return {wrap,input}}
 const dayField=field('cv3-plan-days','Days',String(days),'1'),peopleField=field('cv3-plan-people-count','People',String(Math.max(1,subject.length)),'1'),dailyField=field('cv3-plan-daily','Daily allowance',budget&&days?String(Math.round((budget/days/Math.max(1,subject.length))*100)/100):'0','0.01'),budgetField=field('cv3-plan-budget','Budget',budget==null?'':String(budget),'0.01');
 const peopleInput=peopleField.input;const total=node('p','cv3-plan-total','');const balance=node('p','cv3-plan-balance','');const hint=node('p','cv3-note',assumedDays&&kind==='travel'?'Three days is only a starting point until you set the dates.':'The total is days × people × daily allowance.');
 calc.append(dayField.wrap,peopleField.wrap,dailyField.wrap,budgetField.wrap,total,balance,hint);board.append(calc);
 const recs=node('div','cv3-plan-recs');recs.append(node('p','cv3-label','Recommendations'));
 const answer=assistant.querySelector('.cv-assistant-answer')?.textContent?.trim();if(answer)recs.append(node('article','cv3-plan-rec',answer));
 const next=[...assistant.children].find(el=>el.classList?.contains('cv-ws-meta'))?.textContent?.trim();if(next)recs.append(node('article','cv3-plan-rec',next));
 for(const p of subject)if(p.role)recs.append(node('article','cv3-plan-rec',(p.name||'This person')+' is recorded as '+(roles[p.role]||p.role)+'.'));
 if(!related.length)recs.append(node('article','cv3-plan-rec','No matching open task was found in your workspace.'));
 for(const t of related){const card=node('article','cv3-plan-rec');card.append(node('strong','',t.title||'Task'));const open=node('button','cv3-action','Open task');open.type='button';open.dataset.wsTask=t.id;card.append(open);recs.append(card)}
 board.append(recs);
 const amount=assistant.querySelector('input[name=amount]');let amountEdited=false;amount?.addEventListener('input',e=>{if(e.isTrusted)amountEdited=true});
 function num(input,fallback){const n=Number(input.value);return Number.isFinite(n)&&n>=0?n:fallback}
 function recalc(){const d=Math.max(1,num(dayField.input,1)),p=Math.max(1,num(peopleInput,1)),daily=num(dailyField.input,0),cap=budgetField.input.value===''?null:num(budgetField.input,0),estimate=d*p*daily;total.dataset.cv3Estimate=String(Math.round(estimate*100)/100);total.textContent='Working estimate '+money(estimate);if(cap==null)balance.textContent='Add a budget to see what remains.';else balance.textContent=(estimate>cap?'Over the named budget by ':'Remaining in the named budget: ')+money(Math.abs(cap-estimate));if(amount&&!amountEdited)amount.value=estimate?String(Math.round(estimate*100)/100):'';syncProgress()}
 function syncProgress(){const all=steps.querySelectorAll('.cv3-plan-step-btn'),on=[...all].filter(b=>b.getAttribute('aria-pressed')==='true').length;progress.textContent=on+' of '+all.length+' steps reviewed'}
 for(const input of [dayField.input,peopleInput,dailyField.input,budgetField.input])input.addEventListener('input',()=>{if(input===peopleInput)peopleInput.dataset.cv3Edited='yes';board.dataset.cv3Touched='yes';recalc()});
 peopleInput.dataset.cv3Edited='no';recalc();
 const route=assistant.querySelector('.cv-assistant-route');if(route)route.hidden=true;
 const form=assistant.querySelector('form');if(form)form.before(board);else assistant.append(board);
 assistant.dataset.cv3Plan='yes';assistant.dataset.cv3PlanSource=overview?.team?.length?'live':'local';
}
function upgradeWorkspaceLabels(){const nav=$('.cv-ws-tabs');if(nav&&!nav.dataset.cv3Nav){nav.dataset.cv3Nav='yes';for(const [id,text] of [['overview','Focus'],['projects','Work'],['team','People']]){const item=nav.querySelector('[data-ws-tab='+id+']');if(item)item.textContent=text}}
}
function updateFileUI(){for(const input of $$('.cv-workspace input[type=file]')){if(input.dataset.cv3File)return;input.dataset.cv3File='yes';const form=input.closest('form');if(!form)return;form.classList.add('cv3-upload-form');const caption=form.querySelector('.cvfix-file-caption');if(caption)caption.textContent='Choose a reference · 20 MB images/documents or 32 MB video';}}
function run(){try{ensureArtwork();upgradeWorkspaceLabels();upgradePersonForms();upgradeMentionSelects();upgradeRequestForm();settleTaskFields();upgradeTaskForm();upgradeFocus();upgradeMind();updateFileUI()}catch(e){console.warn('Communiverse presentation enhancement',e?.message||e)}}
let scheduled=0;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=requestAnimationFrame(()=>{scheduled=0;run()})});
function boot(){run();observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
