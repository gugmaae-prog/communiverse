import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../goal-planner.js',import.meta.url),'utf8');
const guides=JSON.parse(await readFile(new URL('../../design-system/operating-guides.json',import.meta.url),'utf8'));
const context={window:{__cvOperatingGuides:guides},crypto:webcrypto};vm.runInNewContext(source,context);const planner=context.window.__cvGoalPlanner;
test('Recruitment intent tolerates the submitted typos and distinguishes equipment',()=>{
 for(const p of ['I am looking for ambassadors','i am lookig for more ambasadors','We need 5 new ambassadors','Find an ambassador','Recruit ambassadors in Colombia'])assert.equal(planner.recruitment(p),true,p);
 for(const p of ['I need cameras for ambassadors','Plan an ambassador trip for Luna','Who are our ambassadors?','Find a camera for ambassadors'])assert.equal(planner.recruitment(p),false,p);
});
test('Recruitment covers the complete lifecycle without assumed people, dates or prices',()=>{
 const plan=planner.blueprint('I am looking for ambassadors');assert.equal(plan.title,'Recruit ambassadors');assert.equal(plan.steps.length,7);
 assert.match(plan.steps[4].title,/Approve/);assert.equal(plan.steps[4].approval,true);assert.match(plan.steps[6].title,/results/);
 for(const step of plan.steps){assert.equal(step.owner,'');assert.equal(step.due,'');assert.ok(step.actions.length>=3);assert.ok(step.output);assert.ok(step.actions.every(a=>!a.done));}
 assert.ok(!JSON.stringify(plan).includes('Daily allowance'));
});
test('Event and content goals get different useful deliverables',()=>{
 assert.match(planner.blueprint('Organize a workshop').steps[1].output,/venue/);
 assert.match(planner.blueprint('Launch a content campaign').steps[1].output,/Story/);
 assert.ok(planner.blueprint('Improve our process').steps[0].actions[0].label.includes('Improve our process'));
});
test('Informational questions do not become a working plan',()=>{
 assert.equal(planner.shouldPlan('Who are our ambassadors?'),false);assert.equal(planner.shouldPlan('How can we recruit ambassadors?'),true);
});

test('Only explicit recruitment context is filled from the goal',()=>{
 const details=planner.contextFrom('We need 5 new ambassadors in Colombia starting 2026-11-01');assert.equal(details.count,'5');assert.equal(details.region,'Colombia');assert.equal(details.start,'2026-11-01');
 assert.equal(planner.contextFrom('We have 3 ambassadors and want more').count,'');assert.equal(planner.contextFrom('I am looking for ambassadors').start,'');
});
test('Sales, partnerships and business planning use their own workflow',()=>{
 for(const [prompt,title,output] of [['Improve sales','Sales and customer follow-up','Qualified opportunity'],['Build partnerships','Partnership development','Partner shortlist'],['Plan our revenue model','Business and revenue planning','Business model']]){
  const plan=planner.blueprint(prompt);assert.equal(plan.title,title);assert.equal(plan.steps.length,6);assert.ok(plan.steps.some(s=>s.output.includes(output)));assert.ok(plan.steps.every(s=>!s.owner&&!s.due));
 }
});
test('Artist, community, equipment, travel and training goals receive operational steps',()=>{
 for(const [prompt,id] of [['Find new artists','artist-discovery'],['Build community engagement','community-programmes'],['Plan camera equipment','equipment-procurement'],['Plan a trip','travel-planning'],['Prepare team training','team-onboarding']])assert.equal(planner.blueprint(prompt).title,guides.find(g=>g.id===id).title);
});
test('General workflow guidance never invents CEO approval',()=>{
 const p=planner.blueprint('Build partnerships');assert.ok(p.steps.some(s=>s.approval));assert.ok(p.steps.filter(s=>s.approval).every(s=>s.approvalLabel==='Required approval before commitments.'));
});
