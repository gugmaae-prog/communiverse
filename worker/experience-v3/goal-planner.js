/* Goal-aware draft planning. Writes use the existing permission-enforcing APIs. */
(() => {
  'use strict';
  if (window.__cvGoalPlanner) return;
  const ROOT = '/communiverse/';
  const text = (v, limit = 2500) => typeof v === 'string' ? v.trim().slice(0, limit) : '';
  const uuid = v => /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v || '');
  const el = (tag, cls, value) => { const n = document.createElement(tag); if (cls) n.className = cls; if (value !== undefined) n.textContent = value; return n; };
  const button = (label, action, primary = false) => { const b = el('button', 'cvgp-action' + (primary ? ' is-primary' : ''), label); b.type = 'button'; b.addEventListener('click', action); return b; };
  const glyph = kind => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); for (const [k,v] of Object.entries({viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'1.7','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'})) s.setAttribute(k,v); const p = document.createElementNS(s.namespaceURI,'path'); p.setAttribute('d',kind==='trash'?'M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6':kind==='close'?'M6 6l12 12M18 6 6 18':'M6 9l6 6 6-6'); s.append(p); return s; };
  const recruitment = prompt => /\bamb[a-z]*[ds][a-z]*r?s?\b/i.test(prompt) && (/\b(recruit\w*|hir\w*)\b/i.test(prompt) || /\b(?:look\w*|find\w*|seek\w*|search\w*|need\w*|want\w*|get)(?:\s+(?:for|more|new|some|additional|\d+|an?)){0,5}\s+amb[a-z]*[ds][a-z]*r?s?\b/i.test(prompt));
  const meetingTopic = prompt => /\b(meet(?:ings?)?|catch[ -]?up|working lunch|team lunch|dinner meeting)\b/i.test(prompt);
  const meetingGoal = prompt => meetingTopic(prompt)
    && !/^\s*(?:show|list|find|search|when is|when are|where is|where are|who is|who are|cancel|delete|reschedule)\b/i.test(prompt)
    && !/\b(?:(?:want|need|would like)\s+to\s+(?:know|see|check|find out)|(?:do not|don't|no longer)\s+(?:want|need|plan))\b/i.test(prompt)
    && /\b(want\w*|wnat|wanna|need\w*|plan\w*|organis\w*|organiz\w*|arrang\w*|schedul\w*|set up|hold|host|book|prepar\w*|create\w*|let[’']?s|can (?:i|we|you)|could (?:i|we|you))\b/i.test(prompt);
  const shouldPlan = prompt => meetingTopic(prompt) ? meetingGoal(prompt) : recruitment(prompt) || /\b(plan\w*|organis\w*|organiz\w*|launch\w*|create\w*|prepar\w*|recruit\w*|look\w*|need\w*|want\w*|build\w*|develop\w*|improve\w*|train\w*|onboard\w*)\b/i.test(prompt) || /how (?:do|can|should) (?:i|we)/i.test(prompt);
  // Each phase has a concrete output and editable actions; no invented dates or fees.
  const phase = (title, summary, actions, output, approval = false) => ({id:crypto.randomUUID(),title,summary,actions:actions.map(label=>({label,done:false})),output,approval,owner:'',due:''});
  function guidePlan(prompt, ids) {
    const q=prompt.toLowerCase(),guides=window.__cvOperatingGuides||[];
    const matches=guides.filter(g=>!ids||ids.includes(g.id)).map(g=>({g,score:g.terms.reduce((n,t)=>n+(new RegExp('\\b'+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(q)?t.includes(' ')?5:2:0),0)})).filter(x=>x.score).sort((a,b)=>b.score-a.score);
    if(!matches.length)return null;const g=matches[0].g;
    return {title:g.title,guideId:g.id,intro:g.summary,steps:g.steps.map(([title,summary,output])=>phase(title,summary,[summary,'Confirm the responsible person and any missing information','Record the outcome and next step'],output,/review commitments|request approval|review.*approval|confirm decisions/i.test(title))).map(s=>({...s,approvalLabel:'Required approval before commitments.'}))};
  }
  function blueprint(prompt) {
    if (meetingGoal(prompt)) {
      const ambassadors=/\bamb[a-z]*[ds][a-z]*r?s?\b/i.test(prompt),restaurant=/\b(restaur\w*|dinner|lunch|cafe|café)\b/i.test(prompt);
      return {title:ambassadors?'Plan your ambassador meeting':'Plan your meeting',guideId:'meeting-planning',intro:restaurant?'A practical plan for meeting together at a restaurant. Confirm the people, place and time before sending invitations.':'Agree the purpose, people and arrangements, then prepare an invitation for review.',steps:[
        phase('Agree the purpose and people','Decide what the meeting should achieve and who needs to join.',[ambassadors?'Choose the ambassadors who should attend; confirm the programme lead':'Choose the participants and meeting owner','Define the decisions, updates or support needed','Ask about availability, dietary requirements and access needs'],'Meeting purpose and attendee shortlist'),
        phase(restaurant?'Find a suitable restaurant':'Choose the place and format',restaurant?'Choose a place where the group can comfortably hear and speak to one another.':'Choose an in-person venue or a suitable meeting link.',restaurant?['Confirm the city and compare quiet, accessible restaurants with enough seating','Check menu choices, dietary needs, parking or transport, and group availability','Ask for a written quote and check minimum spend, deposits and cancellation terms']:['Confirm the city or online format','Check capacity, accessibility and practical needs','Confirm venue or meeting-link availability'],'Venue shortlist and practical requirements'),
        phase('Confirm time and costs','Agree availability and review any commitments before booking.',['Collect participant availability and confirm the date, start/end time and time zone',restaurant?'Confirm headcount and the quoted meal or venue cost; leave unknown amounts unset':'Confirm headcount and any venue or equipment costs','Get the required spending approval before paying a deposit or making commitments'],'Confirmed arrangements and any required approval',true),
        phase('Prepare the agenda','Keep the discussion focused and leave space for decisions.',[ambassadors?'Cover programme priorities and a brief update from each ambassador':'Cover the meeting purpose and participant updates','Discuss blockers, ideas and support needed','Leave time to agree actions, owners and the next check-in'],'Agenda and supporting materials'),
        phase('Review and send invitations','Make it easy for people to understand and confirm the arrangements.',['Prepare the attendee list, date/time, time zone, location or map link and agenda','Review the invitation before scheduling and sending it','Track replies and reconfirm attendance and venue requirements'],'Reviewed invitations and attendance responses'),
        phase('Meet and follow up','Turn the conversation into clear next steps.',['Use the agenda and record decisions during the meeting','Confirm an owner and due date for each agreed action','Share the reviewed summary and next check-in; record any actual costs'],'Meeting notes, assigned actions and follow-up')
      ].map(s=>({...s,approvalLabel:s.approval?'Required approval before booking or spending.':''}))};
    }
    if (recruitment(prompt)) return {title:'Recruit ambassadors',intro:'A recruitment plan, from finding people to helping them succeed.',steps:[
      phase('Define the brief','Agree on the role, region and what success looks like.',['Describe who the ambassador will represent','Define responsibilities and selection criteria','Agree how the programme will measure success'],'Recruitment brief'),
      phase('Find candidates','Use community referrals, relevant networks and targeted outreach.',['Map the communities and maker networks in the target region','Prepare an outreach message and application questions','Ask for referrals and record interested candidates'],'Candidate pool'),
      phase('Review and shortlist','Assess community ties, storytelling and availability.',['Use the same role-based scorecard for each candidate','Review examples of community work and storytelling','Confirm interest and availability; record shortlist reasons'],'Candidate shortlist'),
      phase('Meet and run a small trial','Use a structured conversation and a practical sample.',['Discuss responsibilities, support needs and availability','Agree a small practical sample and its evaluation criteria','Review the sample and collect feedback'],'Interview and trial notes'),
      phase('Approve people and terms','Confirm expectations, compensation and the decision owner.',['Prepare the proposed ambassador list and reasons','Confirm responsibilities, compensation and agreement terms','Obtain CEO sign-off before making commitments'],'Approved selection and terms',true),
      phase('Onboard and launch','Provide training, access, a first assignment and support.',['Introduce the programme lead and support contacts','Arrange agreed training and appropriate access after approval','Set a first assignment and regular check-ins'],'Onboarding and first assignment'),
      phase('Check results and improve','Review engagement, content quality and support needs.',['Review the agreed success measures and content quality','Ask ambassadors what support they need','Agree improvements and the next review'],'Programme review')
    ]};
    const businessPlan=guidePlan(prompt,['sales-pipeline','partnership-development','business-planning']);if(businessPlan)return businessPlan;
    if (/\b(event|workshop|exhibition|meetup)\b/i.test(prompt)) return {title:'Plan the event',intro:'From a clear brief to a well-run event and follow-up.',steps:[
      phase('Define the event','Agree the purpose, audience and format.',['Write the event brief','Confirm the intended audience and format','Agree the success measures'],'Event brief'),
      phase('Confirm people and place','Identify hosts, contributors and a suitable venue.',['Check relevant workspace activity','Confirm contributor interest and venue suitability','Document availability before choosing a date'],'People and venue shortlist'),
      phase('Build the programme','Make the schedule and practical needs clear.',['Draft the agenda','List equipment, accessibility and support needs','Confirm responsibilities'],'Programme and requirements'),
      phase('Approve commitments','Review fees and arrangements before committing.',['Collect quotes only where needed','Review proposed agreements and spend','Obtain the required approval'],'Approved arrangements',true),
      phase('Invite and prepare','Make the event easy to discover and attend.',['Prepare the invitation and registration flow','Share through relevant communities','Confirm attendance and the final checklist'],'Invitations and delivery checklist'),
      phase('Run the event','Coordinate delivery and support attendees.',['Brief the team','Run the agreed programme','Record issues and feedback'],'Event delivery'),
      phase('Follow up','Review outcomes and maintain connections.',['Thank contributors and attendees','Review the success measures','Agree the next steps'],'Follow-up and review')
    ]};
    if (/\b(content|campaign|social|video|footage)\b/i.test(prompt)) return {title:'Plan the content',intro:'A clear route from the brief to publication and learning.',steps:[
      phase('Define the brief','Agree the audience, message and outcome.',['Write the purpose and audience','Define the message and formats','Agree the success measures'],'Content brief'),
      phase('Develop the story','Use relevant people, sources and permissions.',['Identify suitable stories and contributors','Check source information','Confirm contributor consent and permissions'],'Story outline'),
      phase('Prepare production','Plan the people, materials and schedule.',['List the required assets and equipment','Confirm availability','Assign production responsibilities'],'Production plan'),
      phase('Create and edit','Produce the agreed content.',['Capture or develop the assets','Edit for the agreed formats','Check accuracy, captions and accessibility'],'Content draft'),
      phase('Review and approve','Obtain the appropriate review before publication.',['Collect feedback from the responsible people','Resolve changes','Confirm publication approval'],'Approved content',true),
      phase('Publish and learn','Release the content and review results.',['Confirm the publishing schedule','Publish through the approved channels','Review outcomes and improvements'],'Publication and review')
    ]};
    const operatingPlan=guidePlan(prompt);if(operatingPlan)return operatingPlan;
    return {title:text(prompt,100) || 'Your plan',intro:'Turn your goal into clear actions, owners and outcomes.',steps:[
      phase('Define the outcome','Make the goal and success criteria clear.',['Clarify the goal: '+text(prompt,250),'Agree what a successful outcome looks like','Identify missing information'],'Goal brief'),
      phase('Check the context','Use relevant records and dependencies.',['Review related work in the workspace','Confirm what is already underway','Identify dependencies and constraints'],'Context and dependencies'),
      phase('Agree the approach','Choose the practical route to the outcome.',['Compare suitable approaches','Confirm the people and resources needed','Document the chosen approach'],'Delivery approach'),
      phase('Assign the work','Make responsibilities and timing explicit.',['Assign an owner to each next step','Confirm availability before setting dates','Arrange the required support'],'Assigned work plan'),
      phase('Review and approve','Resolve decisions before commitments.',['Review the plan with the responsible people','Obtain any required spending or access approval','Confirm readiness to proceed'],'Reviewed plan'),
      phase('Deliver and review','Complete the work and check its impact.',['Carry out the agreed work','Review the success criteria','Document the outcome and remaining work'],'Outcome and follow-up')
    ]};
  }
  function contextFrom(prompt) {
    const count=prompt.match(/\b(?:recruit|hire|find|need|want|looking\s+for|lookig\s+for|seek)\s+(?:at least\s+|up to\s+)?(\d{1,4})\s+(?:new\s+|more\s+|additional\s+)?amb[a-z]*[ds][a-z]*r?s?\b/i)?.[1] || '';
    const region=text(prompt.match(/\b(?:in|from|across)\s+([^.,!?]+?)(?=\s+(?:by|with|starting|for|to)\s|[.,!?]|$)/i)?.[1],250);
    const candidate=prompt.match(/\b(?:by|start(?:ing)?(?:\s+on)?|from)\s+(\d{4}-\d{2}-\d{2})\b/i)?.[1] || '';
    let start='';try{if(candidate&&new Date(candidate+'T00:00:00Z').toISOString().slice(0,10)===candidate)start=candidate;}catch{}
    return {region,count,start};
  }
  async function api(path, data) {
    const options = {credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}};
    if (data !== undefined) { options.method='POST'; options.headers['Content-Type']='application/json'; options.body=JSON.stringify(data); }
    const response=await fetch(ROOT+'api/workspace/'+path,options);
    const result=await response.json(); if(!response.ok) throw Error(result.error || 'The workspace could not complete this step.'); return result;
  }
  function render(assistant, prompt, overview) {
    const profile=overview?.person,team=overview?.team || [],pattern=blueprint(prompt);
    const storageKey=profile?.id ? 'cv-goal-plan:v1:'+encodeURIComponent(profile.id)+':'+encodeURIComponent(prompt.toLowerCase()) : '';
    let model={version:1,goal:prompt,title:pattern.title,region:'',count:'',start:'',budget:'',currency:'AED',costNotes:'',project:'',steps:pattern.steps,submission:null,...(recruitment(prompt)?contextFrom(prompt):{})};
    try {
      const saved=storageKey && JSON.parse(localStorage.getItem(storageKey));
      if(saved?.version===1 && saved.goal?.toLowerCase()===prompt.toLowerCase() && Array.isArray(saved.steps) && saved.steps.length>0 && saved.steps.length<=20 && saved.steps.every(s=>uuid(s.id)&&text(s.title,140)&&Array.isArray(s.actions)&&s.actions.length<=10)) {
        model={...model,...saved};
        model.steps=model.steps.map(s=>({...s,owner:team.some(p=>p.id===s.owner)?s.owner:'',title:text(s.title,140),summary:text(s.summary,500),output:text(s.output,250),actions:s.actions.map(a=>({label:text(a.label,500),done:!!a.done})),approval:!!s.approval,approvalLabel:text(s.approvalLabel,250)}));
        if(model.submission && (!uuid(model.submission.requestId)||!Array.isArray(model.submission.tasks)||model.submission.tasks.some(t=>!uuid(t.requestId)))) model.submission=null;
      }
    } catch { /* Unreadable local drafts never affect workspace authorization. */ }
    let busy=false,reviewing=false;
    const board=el('section','cv3-plan cvgp');board.setAttribute('aria-label','Cosmos plan');board.dataset.cv3Touched='no';
    assistant.classList.add('cvgp-assistant');
    const grid=el('div','cvgp-grid'),main=el('section','cvgp-main'),side=el('aside','cvgp-side');
    const header=el('div','cvgp-heading'),title=el('h2','',model.title),badge=el('span','cvgp-badge','Draft');
    const close=button('Close plan',()=>{const box=assistant.closest('#cv-ws-search-results');if(box)box.hidden=true;document.querySelector('#cv-ws-search')?.focus();});close.className='cvgp-icon';close.setAttribute('aria-label','Close plan');close.title='Close plan';close.replaceChildren(glyph('close'));
    header.append(title,badge,close);
    const goal=el('div','cvgp-goal'),goalCopy=el('p','',prompt),editGoal=button('Edit goal',()=>{const input=document.querySelector('#cv-ws-search');if(input){input.value=model.goal;input.focus();input.select();}});goal.append(goalCopy,editGoal);
    main.append(header,goal,el('p','cvgp-intro',pattern.intro));
    const sectionHead=el('div','cvgp-section-heading');sectionHead.append(el('h3','','Your plan'));const count=el('span','cvgp-muted');sectionHead.append(count);
    const accordionName='cvgp-'+crypto.randomUUID();const steps=el('div','cvgp-steps'),addStep=button('Add a phase',()=>{if(model.steps.length>=20)return;model.steps.push(phase('New phase','Describe what needs to happen.',['Add the first action'],'Expected outcome'));changed();paintSteps(model.steps.length-1);});
    main.append(sectionHead,steps,addStep);
    const review=el('section','cvgp-review');review.hidden=true;review.setAttribute('aria-label','Review plan');
    const foot=el('div','cvgp-footer'),status=el('p','cvgp-status','Draft only — no tasks created yet.');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    const isMeeting=pattern.guideId==='meeting-planning';
    if(isMeeting)board.classList.add('is-meeting');
    if(isMeeting)status.textContent='Draft plan · no meeting scheduled or invitations sent.';
    const actions=el('div','cvgp-actions'),save=button('Save draft',()=>persist(true)),next=button(isMeeting?'Review task plan':'Review plan',showReview,!isMeeting);actions.append(save,next);foot.append(status,actions);
    if(isMeeting)actions.append(button('Prepare invitation',()=>{
      const trigger=document.querySelector('[data-ws-meeting-new]');if(!trigger){status.textContent='Open Schedule a meeting to prepare your invitation.';return;}
      trigger.click();const form=document.querySelector('#cv-ws-dialog form[data-ws-enhanced="meeting"]');if(!form){status.textContent='The invitation form could not open. Try Schedule a meeting.';return;}
      form.elements.title.value=pattern.title==='Plan your ambassador meeting'?'Ambassador meeting':'Team meeting';
      form.elements.location.value=text(model.region,240);
      const agenda=model.steps.find(s=>/agenda/i.test(s.title))||blueprint(prompt).steps[3];
      form.elements.note.value=['Purpose: '+text(model.goal,500),'Proposed agenda:',...agenda.actions.map(a=>'- '+a.label)].join('\n').slice(0,2000);
      status.textContent='Invitation draft opened. Choose attendees and times, then review before sending.';
      form.elements.title.focus();
    },true));
    function changed(){board.dataset.cv3Touched='yes';status.textContent='Unsaved changes · no tasks created yet.';}
    function persist(announce=false){if(!storageKey){status.textContent='Wait for your workspace account to load, then try again.';return false;}try{model.savedAt=Date.now();localStorage.setItem(storageKey,JSON.stringify(model));const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith('cv-goal-plan:v1:'+encodeURIComponent(profile.id)+':'))keys.push(key);}if(keys.length>20){keys.filter(k=>k!==storageKey).sort((a,b)=>{try{return JSON.parse(localStorage.getItem(a)).savedAt-JSON.parse(localStorage.getItem(b)).savedAt;}catch{return 0;}}).slice(0,keys.length-20).forEach(k=>localStorage.removeItem(k));}if(announce)status.textContent='Draft saved in this browser · no new tasks created.';return true;}catch{status.textContent='This browser could not save the draft. Keep this page open and try again.';return false;}}
    function labeled(label,value,change,{type='text',placeholder='Not set',max=250,min,step}={}){const wrap=el('label','cvgp-field',label),input=el('input');input.type=type;input.value=value || '';input.placeholder=placeholder;input.maxLength=max;if(min!==undefined)input.min=min;if(step)input.step=step;input.addEventListener('input',()=>{change(input.value);changed();});wrap.append(input);return {wrap,input};}
    function ownerSelect(step){const wrap=el('label','cvgp-field','Owner'),select=el('select');select.setAttribute('aria-label','Owner for '+step.title);select.append(new Option('Not assigned',''));team.forEach(p=>select.append(new Option(p.name,p.id)));select.value=step.owner;select.addEventListener('change',()=>{step.owner=select.value;changed();});wrap.append(select);return wrap;}
    function paintSteps(openIndex=0){steps.replaceChildren();count.textContent=model.steps.length+' phases';model.steps.forEach((step,index)=>{
      const detail=el('details','cvgp-step');detail.setAttribute('name',accordionName);detail.open=index===openIndex;const summary=el('summary'),num=el('span','cvgp-number',String(index+1)),copy=el('span','cvgp-summary-copy');copy.append(el('strong','',step.title),el('span','',step.summary));summary.append(num,copy,glyph('chevron'));detail.append(summary);
      const content=el('div','cvgp-step-content'),list=el('div','cvgp-checklist');step.actions.forEach(action=>{const label=el('label'),check=el('input');check.type='checkbox';check.checked=action.done;check.addEventListener('change',()=>{action.done=check.checked;changed();});label.append(check,el('span','',action.label));list.append(label);});content.append(list);
      const fields=el('div','cvgp-step-fields');fields.hidden=isMeeting;fields.append(ownerSelect(step),labeled('Due date (optional)',step.due,v=>step.due=v,{type:'date'}).wrap);content.append(fields,el('p','cvgp-output','Output: '+step.output));if(step.approval)content.append(el('p','cvgp-approval',step.approvalLabel||'CEO sign-off required before commitments.'));
      const edit=button('Edit phase',()=>{editor.hidden=!editor.hidden;if(!editor.hidden)editor.querySelector('input')?.focus();}),editor=el('div','cvgp-editor');editor.hidden=true;
      const phaseTitle=labeled('Phase title',step.title,v=>{step.title=v;copy.querySelector('strong').textContent=v;},{max:140});const description=labeled('Summary',step.summary,v=>{step.summary=v;copy.querySelector('span').textContent=v;},{max:500});const actionField=el('label','cvgp-field','Actions (one per line)'),area=el('textarea');area.rows=4;area.value=step.actions.map(a=>a.label).join('\n');area.maxLength=2000;area.addEventListener('input',()=>{step.actions=area.value.split('\n').filter(s=>s.trim()).slice(0,10).map(label=>({label:text(label,500),done:false}));changed();});actionField.append(area);editor.append(phaseTitle.wrap,description.wrap,actionField,labeled('Expected output',step.output,v=>{step.output=v;content.querySelector('.cvgp-output').textContent='Output: '+v;}).wrap,button('Done editing',()=>paintSteps(index)));
      const controls=el('div','cvgp-phase-actions'),remove=button('Delete phase',()=>{if(model.steps.length===1){status.textContent='Keep at least one phase in the plan.';return;}model.steps.splice(index,1);changed();paintSteps(Math.min(index,model.steps.length-1));});remove.className='cvgp-icon';remove.setAttribute('aria-label','Delete phase '+step.title);remove.title='Delete phase';remove.replaceChildren(glyph('trash'));controls.append(edit,remove);content.append(editor,controls);detail.append(content);
      steps.append(detail);
    });}
    side.append(el('h3','','A few details first'),el('p','cvgp-muted','Answer these to tailor the plan.'));
    const audienceContext=['sales-pipeline','partnership-development','business-planning'].includes(pattern.guideId)||pattern.title==='Plan the content';const showHeadcount=!audienceContext;
    side.append(labeled(recruitment(prompt)?'Where should we recruit?':isMeeting?'Restaurant or location (optional)':audienceContext?'Which market or audience?':pattern.guideId==='artist-discovery'?'Which craft or region?':'Where will this happen?',model.region,v=>model.region=v).wrap);
    if(showHeadcount)side.append(labeled(recruitment(prompt)?'How many ambassadors?':pattern.guideId==='artist-discovery'?'How many artists? (optional)':'How many people? (optional)',model.count,v=>model.count=v,{type:'number',min:'1',step:'1'}).wrap);
    side.append(labeled(recruitment(prompt)?'When should they start?':'Target date (optional)',model.start,v=>model.start=v,{type:'date'}).wrap);
    const costs=el('details','cvgp-costs'),costTitle=el('summary','', 'Costs (optional)');costTitle.append(glyph('chevron'));costs.append(costTitle,el('p','cvgp-muted','Add only if funding is needed.'));
    const currency=el('label','cvgp-field','Currency'),currencySelect=el('select');['AED','USD','EUR','GBP','COP','PHP','SAR'].forEach(c=>currencySelect.append(new Option(c,c)));currencySelect.value=model.currency;currencySelect.addEventListener('change',()=>{model.currency=currencySelect.value;changed();});currency.append(currencySelect);costs.append(labeled('Budget (optional)',model.budget,v=>model.budget=v,{type:'number',min:'0',step:'0.01'}).wrap,currency,labeled('What needs funding?',model.costNotes,v=>model.costNotes=v,{max:500}).wrap,el('p','cvgp-muted','An estimate does not approve spending.'));side.append(costs);
    const related=el('details','cvgp-related');related.append(el('summary','','Related work'),el('p','cvgp-muted','Check existing activity before starting new work.'));
    const relevant=(overview?.tasks||[]).filter(t=>{const s=(t.title+' '+t.description).toLowerCase();return !['done','archived'].includes(t.status)&&(recruitment(prompt)?/recruit|scorecard|ambassador programme|ambassador program|new ambassador/.test(s):prompt.toLowerCase().split(/\W+/).filter(w=>w.length>4).some(w=>s.includes(w)));}).slice(0,4);
    for(const task of relevant){const a=el('a','cvgp-related-link',task.title);a.href=ROOT+'workspace/?task='+encodeURIComponent(task.id);related.append(a);}if(!relevant.length)related.append(el('p','cvgp-muted',profile?'No matching open work found in your available records.':'Workspace context is loading.'));side.append(related);
    const guidance=el('details','cvgp-guidance');guidance.append(el('summary','','Planning guidance'),el('p','cvgp-muted','General guidance is separate from company documents and live work.'));
    const guidanceBody=el('div');guidance.append(guidanceBody);side.append(guidance);let guidanceState='idle';
    guidance.addEventListener('toggle',async()=>{
      if(!guidance.open||guidanceState!=='idle')return;guidanceState='loading';guidanceBody.replaceChildren(el('p','cvgp-muted','Checking the guidance available to your account…'));
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
      try{
        const response=await fetch(ROOT+'api/knowledge/query?q='+encodeURIComponent(prompt)+'&domain=business',{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal});
        if(!response.ok)throw Error('Guidance could not be checked. Open this section again to retry.');const result=await response.json(),k=result.knowledge;
        if(!k||!Array.isArray(k.guidance)||!Array.isArray(k.documents))throw Error('Guidance could not be checked.');guidanceBody.replaceChildren();
        for(const g of k.guidance.slice(0,3)){const item=el('section');item.append(el('h3','',text(g.title,140)),el('p','',text(g.summary,600)),el('p','cvgp-muted','General operating guidance · not company policy or a live record'));const list=el('ul');for(const q of (g.questions||[]).slice(0,4))list.append(el('li','',text(q,300)));item.append(list);guidanceBody.append(item);}
        if(k.documents.length){guidanceBody.append(el('h3','','Company references'));for(const d of k.documents.slice(0,3)){const item=el('p','cvgp-context',text(d.title,160)+' · '+text(d.status,60)+' · '+text(d.source_date||'Undated',40)+'\n'+text(d.content,600));guidanceBody.append(item);}}
        if(!k.guidance.length&&!k.documents.length)guidanceBody.append(el('p','cvgp-muted','No matching guidance or company references were found in your permitted sources.'));
        if(k.unavailable?.length)guidanceBody.append(el('p','cvgp-muted','Some live records could not be checked. No missing facts were assumed.'));guidanceState='ready';
      }catch(e){guidanceState='idle';guidanceBody.replaceChildren(el('p','cvgp-muted',e.name==='AbortError'?'Guidance took too long. Open this section again to retry.':e.message));}finally{clearTimeout(timeout)}
    });
    const answer=text(assistant.querySelector('.cv-assistant-answer')?.textContent);if(answer){const advice=el('details','cvgp-related');advice.append(el('summary','','Assistant context'),el('p','cvgp-context',answer));side.append(advice);}
    function validate(){if(!profile?.id){status.textContent='Your workspace account is still loading.';return false;}if(!model.steps.every(s=>text(s.title,140)&&s.actions.length)){status.textContent='Give every phase a title and at least one action.';return false;}if(model.count!==''&&(!Number.isInteger(Number(model.count))||Number(model.count)<1)){status.textContent='Enter a whole number of people greater than zero.';return false;}if(model.budget!==''&&(!Number.isFinite(Number(model.budget))||Number(model.budget)<0)){status.textContent='Enter a valid budget or leave it unset.';return false;}return true;}
    function showReview(){if(!validate())return;reviewing=true;main.hidden=true;side.hidden=true;review.hidden=false;review.replaceChildren();const heading=el('h2','','Review your plan');heading.tabIndex=-1;review.append(heading,el('p','cvgp-muted','Creating this plan records one task per phase. Assigned owners may receive workspace notifications. Spending and ambassador selection still need the required approval.'));
      const assignment=el('div','cvgp-review-assignment');assignment.append(el('p','','Choose an owner for every phase.'),button('Assign unassigned phases to me',()=>{model.steps.forEach(s=>{if(!s.owner)s.owner=profile.id;});changed();paintSteps();showReview();}));review.append(assignment);
      const projectLabel=el('label','cvgp-field','Project'),projectSelect=el('select');projectSelect.append(new Option('Create a new project',''));(overview?.projects||[]).forEach(p=>projectSelect.append(new Option(p.title,p.id)));projectSelect.value=model.project;projectSelect.disabled=!!model.submission;projectSelect.addEventListener('change',()=>{model.project=projectSelect.value;changed();});projectLabel.append(projectSelect);review.append(projectLabel);
      for(const step of model.steps){const row=el('div','cvgp-review-row');row.append(el('strong','',step.title),ownerSelect(step),el('span','cvgp-muted',step.due?'Due '+step.due:'No due date'));if(step.approval)row.append(el('span','cvgp-approval',step.approvalLabel?'Required approval':'CEO sign-off'));review.append(row);}
      const missing=[!model.region&&(audienceContext?'market or audience':'region'),showHeadcount&&!model.count&&'headcount',!model.start&&'start date'].filter(Boolean);if(missing.length)review.append(el('p','cvgp-muted','Still not set: '+missing.join(', ')+'. These can be confirmed in the brief.'));
      const back=button('Back to plan',()=>{reviewing=false;review.hidden=true;main.hidden=false;side.hidden=false;next.textContent='Review plan';paintSteps();});back.classList.add('cvgp-back');back.disabled=!!model.submission;review.append(back);
      next.textContent=model.submission?'Resume creating tasks':'Create '+model.steps.length+' tasks';status.textContent=model.submission?'Resume the saved creation attempt. Existing tasks will not be duplicated.':'Review owners and details before creating work.';heading.focus();
    }
    next.removeEventListener('click',showReview);next.addEventListener('click',()=>reviewing?create():showReview());
    function description(step){return [step.summary,'Actions:',...step.actions.map(a=>'- '+a.label),'Output: '+step.output,'Goal: '+model.goal,model.region?'Region: '+model.region:'',model.count?'Target headcount: '+model.count:'',model.start?'Target start: '+model.start:'',model.budget!==''?'Optional budget estimate: '+model.currency+' '+model.budget:'',model.costNotes?'Funding notes: '+model.costNotes:'',step.approval?(step.approvalLabel||'CEO sign-off required before commitments.') : ''].filter(Boolean).join('\n').slice(0,2500);}
    async function create(){if(busy||!validate())return;if(model.steps.some(s=>!team.some(p=>p.id===s.owner))){status.textContent='Choose an owner for every phase before creating tasks.';return;}
      busy=true;for(const control of board.querySelectorAll('button,input,select,textarea'))control.disabled=true;
      try{
        if(!model.submission){if(model.project){const existing=await api('projects?id='+encodeURIComponent(model.project));const allowed=new Set([existing.project.owner_id,...existing.members,...team.filter(p=>['ceo','operations'].includes(p.role)).map(p=>p.id)]);if(model.steps.some(s=>!allowed.has(s.owner)))throw Error('An assigned owner is not a member of this project. Choose another owner or create a new project.');}
          model.submission={requestId:crypto.randomUUID(),projectId:model.project || '',tasks:model.steps.map(s=>({requestId:s.id,title:s.title,description:description(s),owner_id:s.owner,due_date:s.due,status:'todo',priority:'normal',approval_required:s.approval,resultId:''}))};if(!persist())return;
        }
        if(!persist())return;const job=model.submission;if(!job.projectId){status.textContent='Creating the project…';const p=await api('projects',{title:text(model.title,120),description:text(model.goal,1800),due_date:'',members:[...new Set(job.tasks.map(t=>t.owner_id))],requestId:job.requestId});if(!uuid(p.id))throw Error('The project response could not be verified. Retry this saved attempt.');job.projectId=p.id;if(!persist())return;}
        for(let i=0;i<job.tasks.length;i++){const task=job.tasks[i];if(task.resultId)continue;status.textContent='Creating task '+(i+1)+' of '+job.tasks.length+'…';const result=await api('tasks',{...task,project_id:job.projectId});if(!uuid(result.id))throw Error('The task response could not be verified. Retry this saved attempt.');task.resultId=result.id;if(!persist())return;}
        job.complete=true;persist();status.textContent=job.tasks.length+' tasks created. Open the project to continue.';actions.replaceChildren();const open=el('a','cvgp-action is-primary','Open project');open.href=ROOT+'workspace/?view=projects&project='+encodeURIComponent(job.projectId);actions.append(open);review.replaceChildren(el('h2','','Your plan is now in Work'),el('p','cvgp-muted','The project and tasks are recorded. Required approvals remain in place.'));window.__cvExperienceV3?.invalidateOverview?.();
      }catch(e){status.textContent=e.message;next.textContent=model.submission?'Resume creating tasks':'Create '+model.steps.length+' tasks';}finally{busy=false;for(const control of board.querySelectorAll('button,input,select,textarea'))control.disabled=false;if(model.submission&&!model.submission.complete){for(const control of board.querySelectorAll('input,select,textarea'))control.disabled=true;review.querySelector('.cvgp-review-assignment')?.remove();const back=review.querySelector('.cvgp-back');if(back)back.disabled=true;save.disabled=true;} }
    }
    paintSteps();grid.append(main,side,review);board.append(grid,foot);const form=assistant.querySelector('form');if(form)form.before(board);else assistant.append(board);
    assistant.dataset.cv3Plan='yes';assistant.dataset.cv3PlanSource=profile?.id?'live':'local';
    if(model.submission?.complete){reviewing=true;main.hidden=true;side.hidden=true;review.hidden=false;review.append(el('h2','','This plan has already been created'));actions.replaceChildren();const open=el('a','cvgp-action is-primary','Open project');open.href=ROOT+'workspace/?view=projects&project='+encodeURIComponent(model.submission.projectId);actions.append(open);status.textContent='Your saved plan is already in Work.';}
    else if(model.submission){showReview();for(const input of review.querySelectorAll('input,select,textarea'))input.disabled=true;review.querySelector('.cvgp-review-assignment')?.remove();save.disabled=true;}
    else if(model.savedAt)status.textContent='Saved draft restored from this browser.';
    return board;
  }
  window.__cvGoalPlanner={release:'20261012-meeting-planner',recruitment,meetingGoal,shouldPlan,blueprint,contextFrom,render};
})();
