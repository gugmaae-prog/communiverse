/* Communiverse experience-v2 — staged until authenticated QA succeeds.
 * Never rewrite native artwork [data-open] clicks or replace app-owned dialogs.
 * Do not mutate server data, access tokens, account identities, or upload requests.
 */
(()=>{'use strict';
if(window.__cvExperienceV2)return;
window.__cvExperienceV2={version:'20261009-qa',loaded:true};
const ROOT='/communiverse/';
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const safe=v=>typeof v==='string'?v.trim():'';
const valid=v=>/^[a-zA-Z0-9_-]{1,120}$/.test(safe(v));
const el=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=safe(value).slice(0,1500);return n};
const keepArray=x=>Array.isArray(x)?x:[];
const workStatus={todo:'To do',doing:'In progress',in_progress:'In progress',review:'In review',blocked:'Blocked',done:'Done',archived:'Archived'};
const readableDate=s=>{if(!/^\d{4}-\d\d-\d\d$/.test(safe(s)))return 'No due date';const d=new Date(s+'T12:00:00Z');return Number.isFinite(d.getTime())?d.toLocaleDateString(undefined,{timeZone:'UTC',year:'numeric',month:'short',day:'numeric'}):'No due date'};
const isTaskQuestion=s=>/\b(tasks?|to[- ]?dos?|workload|assigned work|my work|deliverables?|what should i do|what do i need to do)\b/i.test(s)&&!/\b(create|make|add|new|draft|write|remind|delete|change|update|assign|submit)\b/i.test(s);
const isPeopleQuestion=s=>/\b(who (?:is|are|owns|works)|our team|team members)\b/i.test(s);
let lastTaskRequest=0,taskAbort=null,taskView=null;
function toast(msg,kind){const target=$('#cv-ws-status');if(target){target.textContent=msg;target.dataset.kind=kind||'info';}else console.info('[Communiverse]',msg);}
function safeProfile(person,relationship){
 const slug=safe(person.profile_slug);const a=el(valid(slug)?'a':'span','cvfix-person');
 const name=safe(person.name)||safe(person.id)||'Unknown person';const hint=name+' · '+relationship;
 a.dataset.tooltip=hint;a.title=hint;a.setAttribute('aria-label',hint);
 if(a.tagName==='A')a.href=ROOT+'plug/?person='+encodeURIComponent(slug);
 else a.tabIndex=0;
 a.append(el('span','',name.slice(0,1).toUpperCase()));
 const photo=safe(person.photo||person.photo_url);
 const src=photo.startsWith(ROOT)?photo:(valid(slug)?ROOT+'_public/avatar/'+encodeURIComponent(slug):'');
 if(src){const img=el('img');img.src=src;img.alt='';img.loading='lazy';img.addEventListener('error',()=>img.remove(),{once:true});a.append(img)}
 return a;
}
function ownerList(task,project,people){
 const members=[{id:task.owner_id,role:'Task owner'},{id:task.created_by,role:'Created by'},{id:project.owner_id,role:'Project lead'}];
 const dedupe=new Set(),arr=[];
 for(const {id,role} of members){if(!valid(id)||dedupe.has(id))continue;dedupe.add(id);const p=people.get(id)||{id,name:id};arr.push({...p,role})}
 return arr;
}
function drawCard(task,project,people){
 const card=el('article','cvfix-task');
 const top=el('div','cvfix-task-top');
 top.append(el('span','cvfix-project',safe(project.title)||'Project'));
 const status=el('span','cvfix-status',workStatus[task.status]||'Other');
 status.dataset.state=safe(task.status);top.append(status);card.append(top);
 const heading=el('h3','',safe(task.title)||'Untitled task');card.append(heading);
 if(safe(task.description))card.append(el('p','cvfix-desc',task.description.slice(0,220)));
 const bottom=el('div','cvfix-task-bottom'),peopleBox=el('div','cvfix-avatars');
 peopleBox.setAttribute('aria-label','People involved');
 for(const p of ownerList(task,project,people))peopleBox.append(safeProfile(p,p.role));
 bottom.append(peopleBox,el('span','cvfix-due',readableDate(task.due_date)));card.append(bottom);
 const actions=el('div','cvfix-task-bottom');
 const flag=el('span','cvfix-subtle',task.approval_required?'Approval needed':safe(task.priority)&&task.priority!=='normal'?task.priority:'');
 actions.append(flag);
 const open=el('button','cvfix-task-open','Open task');open.type='button';open.dataset.wsTask=task.id;open.setAttribute('aria-label','Open '+(safe(task.title)||'task'));
 actions.append(open);card.append(actions);return card;
}
function showTaskCards(box,overview,query){
 const staff=keepArray(overview.team),person=overview.person||{},people=new Map(staff.filter(p=>valid(p.id)).map(p=>[p.id,p]));
 if(valid(person.id))people.set(person.id,{...(people.get(person.id)||{}),...person});
 const projects=new Map(keepArray(overview.projects).filter(p=>valid(p.id)).map(p=>[p.id,p]));
 const accessible=keepArray(overview.tasks).filter(t=>valid(t.id)&&projects.has(t.project_id)&&t.status!=='archived');
 const startMine=/\bmy\b|assigned to me|mine|what (?:do|should) i/i.test(query);
 const outer=el('section','cvfix-results');outer.setAttribute('aria-label','Workspace tasks');
 const header=el('div','cvfix-results-head');const title=el('h2','', 'Your work, organized');const control=el('div');
 const dismiss=el('button','cvfix-close','Close');dismiss.type='button';dismiss.dataset.cvfixClose='1';
 control.append(dismiss);header.append(title,control);outer.append(header);
 const description=el('p','cvfix-subtle','Live records from your authorized Communiverse workspace.');outer.append(description);
 const switcher=el('div','cvfix-switch');switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Choose task view');
 for(const [key,name] of [['mine','My tasks'],['team','All visible'],['attention','Needs attention']]){const btn=el('button','',name);btn.type='button';btn.dataset.cvfixMode=key;switcher.append(btn)}
 outer.append(switcher);
 const count=el('p','cvfix-subtle'),grid=el('div','cvfix-grid');
 outer.append(count,grid);const prior=box.querySelector('.cvfix-results');if(prior)prior.remove();
 box.hidden=false;box.replaceChildren(outer);taskView={box,outer,grid,count,switcher,all:accessible,people,projects,person,mode:startMine?'mine':'team'};
 renderTasks();
}
function renderTasks(){
 const s=taskView;if(!s||!s.outer.isConnected)return;
 let rows=s.all.slice();
 if(s.mode==='mine')rows=rows.filter(t=>t.owner_id===s.person.id);
 else if(s.mode==='attention')rows=rows.filter(t=>['blocked','review'].includes(t.status));
 const priority={blocked:0,review:1,doing:2,in_progress:2,todo:3,done:4};
 rows.sort((a,b)=>(priority[a.status]??5)-(priority[b.status]??5)||String(a.due_date||'9999').localeCompare(String(b.due_date||'9999')));
 s.count.textContent=rows.length+' verified task'+(rows.length===1?'':'s')+(rows.length>80?' · showing first 80':'');
 s.switcher.querySelectorAll('button[data-cvfix-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cvfixMode===s.mode)));
 s.grid.replaceChildren();
 if(!rows.length){s.grid.append(el('p','cvfix-empty','No tasks match this view.'));return}
 for(const t of rows.slice(0,80))s.grid.append(drawCard(t,s.projects.get(t.project_id),s.people));
}
async function showTaskQuestion(query){
 const box=$('#cv-ws-search-results');if(!box)return;
 if(taskAbort)taskAbort.abort();taskAbort=new AbortController();const token=++lastTaskRequest;
 box.hidden=false;box.replaceChildren(el('div','cvfix-empty','Loading your workspace tasks…'));
 try{
   const r=await fetch(ROOT+'api/workspace/overview',{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'},signal:taskAbort.signal});
   if(!r.ok)throw Error(r.status===401||r.status===403?'Sign in to access your team workspace.':'Unable to load tasks right now.');
   const d=await r.json();
   if(!d||!Array.isArray(d.tasks)||!Array.isArray(d.projects))throw Error('Task data was incomplete. Please refresh and try again.');
   if(token!==lastTaskRequest)return;
   showTaskCards(box,d,query);
 }catch(e){
   if(e?.name==='AbortError'||token!==lastTaskRequest)return;
   box.replaceChildren(el('div','cvfix-error',safe(e.message)||'Unable to load tasks right now.'));
 }
}
function handleAI(e){
 if(e.type==='keydown'){
   if(e.key!=='Enter'||e.target.id!=='cv-ws-search'||e.shiftKey||e.isComposing)return;
 }else if(!e.target.closest('[data-ws-ai-search]'))return;
 const input=$('#cv-ws-search'),query=safe(input?.value);
 if(!isTaskQuestion(query))return;
 e.preventDefault();e.stopImmediatePropagation();showTaskQuestion(query);
}
document.addEventListener('click',handleAI,true);
document.addEventListener('keydown',handleAI,true);
document.addEventListener('click',e=>{
 const close=e.target.closest('[data-cvfix-close]');if(close){e.preventDefault();e.stopImmediatePropagation();lastTaskRequest++;taskAbort?.abort();const box=$('#cv-ws-search-results');if(box){box.hidden=true;box.replaceChildren()}$('#cv-ws-search')?.focus();return}
 const mode=e.target.closest('[data-cvfix-mode]');if(mode&&taskView){e.preventDefault();e.stopImmediatePropagation();taskView.mode=mode.dataset.cvfixMode;renderTasks()}
},true);
/* Native artwork events already work; release the stale expanded tile AFTER
 * the original handler moves the detail host. Never preventDefault or re-dispatch.
 */
document.addEventListener('click',e=>{
 const recommendation=e.target.closest('#cv-work-detail .cv-related [data-open]');
 if(!recommendation)return;
 const nextId=safe(recommendation.dataset.open);
 if(!valid(nextId))return;
 queueMicrotask(()=>{
   const host=$('#cv-work-detail'),dialog=$('#cv-work-dialog');
   const movedToDialog=!!(dialog?.open&&host?.closest('#cv-work-dialog')===dialog&&host.dataset.inline==='false');
   const anotherTile=$$('#cv-feed>.cv-pin.is-work-expanded').some(c=>c.dataset.id===nextId);
   if(!movedToDialog&&!anotherTile)return;
   for(const prior of $$('#cv-feed>.cv-pin.is-work-expanded')){
     if(prior.dataset.id===nextId)continue;
     prior.classList.remove('is-work-expanded');
   }
 });
},false);

let assignments=null,assignmentPromise=null;
async function fetchAssignments(){
 if(assignments)return assignments;
 if(assignmentPromise)return assignmentPromise;
 assignmentPromise=(async()=>{
   const r=await fetch(ROOT+'api/knowledge/artist-assignments',{credentials:'same-origin',headers:{Accept:'application/json'},cache:'no-store'});
   if(!r.ok)throw Error('Assignments are not available.');
   const d=await r.json();
   if(!Array.isArray(d.assignments))throw Error('Invalid assignment data.');
   assignments=new Map(d.assignments.filter(x=>valid(x.artistId)).map(x=>[x.artistId,x.person||null]));
   return assignments;
 })().finally(()=>{assignmentPromise=null});
 return assignmentPromise;
}
async function pipelineAnnotations(){
 const rows=$$('#cv-ws-content .cv-ws-pipeline-name button[data-ws-artist]');
 const pending=rows.filter(r=>!r.closest('.cv-ws-pipeline-name')?.dataset.cvfixDone);
 if(!pending.length)return;
 const stage=pending.map(b=>b.closest('.cv-ws-pipeline-name')).filter(Boolean);
 stage.forEach(p=>{p.dataset.cvfixDone='pending'});
 try{
   const amap=await fetchAssignments();
   for(const btn of pending){
     const wrap=btn.closest('.cv-ws-pipeline-name');if(!wrap||!wrap.isConnected)continue;
     const id=safe(btn.dataset.wsArtist),assigned=amap.get(id);
     const part=el('span','cvfix-assignment');
     if(assigned&&safe(assigned.name)){
       part.append(safeProfile(assigned,'Assigned ambassador'),el('span','cvfix-assignment-label','Assigned ambassador'));
     }else part.append(el('span','cvfix-assignment-label','No assignment recorded'));
     wrap.append(part);wrap.dataset.cvfixDone='yes';
   }
 }catch{
   stage.forEach(p=>{if(p.isConnected)p.dataset.cvfixDone='';});
 }
}
function polishFileControls(){
 for(const input of $$('.cv-workspace input[type=file],#cv-ws-dialog input[type=file]')){
   if(input.dataset.cvfixFile)return;
   input.dataset.cvfixFile='1';
   const helper=el('span','cvfix-file-caption','No file selected');
   helper.setAttribute('role','status');helper.setAttribute('aria-live','polite');
   input.after(helper);
   input.addEventListener('change',()=>{
     input.setCustomValidity('');
     const chosen=keepArray(Array.from(input.files||[]));
     if(!chosen.length){helper.textContent='No file selected';helper.dataset.error='false';return}
     const pieces=[];let fail=false;
     for(const file of chosen){
       const video=/^video\//.test(file.type)||/\.(mp4|mov|webm)$/i.test(file.name);
       const max=(video?32:20)*1048576;
       if(file.size>max)fail=true;
       pieces.push(file.name+' · '+(file.size/1048576).toFixed(1)+' MB');
     }
     helper.textContent=pieces.join(', ')+(fail?' · File exceeds permitted size':'');
     helper.dataset.error=String(fail);
     if(fail)input.setCustomValidity('Please choose a file within the upload size limit.');
   });
 }
}
function fixAvatarLabels(){
 for(const chip of $$('#cv-social-header .cv-profile-chip')){
   if(chip.dataset.cvfixAvatar)return;
   chip.dataset.cvfixAvatar='yes';
   const full=safe(chip.textContent)||'Profile';
   chip.setAttribute('aria-label','Open your Communiverse profile · '+full);
   chip.title='Profile · '+full;
 }
}
let frame=0;
function scan(){fixAvatarLabels();polishFileControls();if($('#cv-ws-content .cv-ws-pipeline-name'))pipelineAnnotations();}
function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;scan()})}
const watcher=new MutationObserver(schedule);
function initialize(){scan();watcher.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
