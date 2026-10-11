import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const sha=s=>createHash('sha256').update(s).digest('hex');
let code=await readFile(resolve(root,'worker.mjs'),'utf8');
if(sha(code)!=='600582d583a8fa6f61c410a57f5c27bee8f04b91ba414a0470a767348bba3636')throw Error('Unexpected source baseline; reconcile before building.');
const replacements=[
 ['business model|strategy|mission|vision|what is communiverse|what do we do|how.*make money|roadmap|RAL|consent|brand guidelines|recruit\\w*|scorecard|fundrais\\w*|compensation|kit budget','business model|revenue model|revenue streams?|monetization|monetisation|value proposition|target (?:audiences?|customers?)|product pillars?|launch strategy|strategy|mission|vision|what is communiverse|what do we do|how.*make money|roadmap|RAL|consent|brand guidelines|recruit\\w*|scorecard|fundrais\\w*|compensation|kit budget'],
 ['return {domain,...result,summary,note,records:','return {domain,collection,...result,summary,note,records:'],
 ['...results.flatMap(r=>r.records.map(x=>x.source))',"...results.flatMap(r=>[...(r.collection?[source(r.collection,'query-summary',observedAt)]:[]),...r.records.map(x=>x.source)])"],
 ["?' Showing '+r.records.length+'; more records are available.':''","?' '+r.records.length+' records returned; more are available.':''"],
 ['for(const x of r.records.slice(0,12))',"if(r.records.length>12)parts.push('First 12 listed below; use the structured records and pagination for the rest.');for(const x of r.records.slice(0,12))"]
];
for(const [from,to]of replacements){if(code.split(from).length!==2)throw Error('Ambiguous build transform');code=code.replace(from,to);}
const expected='1b675a845386ac95e15db48926f4c9e40bd745736611d3ecfb5bc432c5475f54';
if(sha(code)!==expected)throw Error('Assembled output checksum mismatch');
// Apply bounded additions to the verified retained runtime; keep DB documents and access rules intact.
const guides=JSON.parse(await readFile(resolve(root,'../design-system/operating-guides.json'),'utf8'));
const helper=await readFile(resolve(root,'operating-guidance.mjs'),'utf8');
const additions=[
 ["export const RELEASE = '20261009-knowledge-1';","export const RELEASE = '20261011-guidance-1';"],
 ["const results=[],unavailable=[];","const guidance=operatingGuidance(query,OPERATING_GUIDES,observedAt);const results=[],unavailable=[];"],
 ["const sources=[...docs.map", "const sources=[...guidance.map(g=>g.source),...docs.map"],
 ["domains,documents:docs,results,sources", "domains,documents:docs,guidance,results,sources"],
 ["const parts=[];", "const parts=[];for(const g of (k.guidance||[]).slice(0,3))parts.push(g.title+' [general guidance, not company policy or a live record]\\n'+g.summary+'\\n'+g.steps.map((s,i)=>(i+1)+'. '+s[0]+': '+s[1]+' Output: '+s[2]).join('\\n')+'\\nConfirm: '+g.questions.join(' '));"],
 ["evidence=k.documents.slice(0,3).map(d=>`[${d.id};${d.status};${d.source_date}] ${d.title}: ${d.content}`).join('\\n').slice(0,900);", "evidence=k.documents.slice(0,3).map(d=>`[${d.id};${d.status};${d.source_date}] ${d.title}: ${d.content}`).join('\\n').slice(0,k.guidance.length?500:900)+(k.guidance.length?'\\nGENERAL GUIDANCE, NOT COMPANY POLICY: '+k.guidance.slice(0,2).map(g=>g.title+': '+g.summary+' Steps: '+g.steps.map(s=>s[0]).join('; ')).join('\\n').slice(0,600):'');"],
 ["Distinguish dated draft plans from live facts.","Distinguish general workflow guidance from company policy, dated drafts and live facts. Never invent prices, approvals, consent, contacts or dates."],
 ["k.domains.includes('business')&&k.documents.length&&b.synthesis", "(k.domains.includes('business')||k.guidance.length)&&(k.documents.length||k.guidance.length)&&b.synthesis"],
 ["answer:d.answer+(refs?'\\n\\nRetrieved references: '+refs:''),", "answer:d.answer+(refs?'\\n\\nRetrieved references: '+refs:'')+(k.guidance.length?'\\n\\nGeneral operating guidance (not company policy): '+k.guidance.map(g=>g.title).join('; '):''),"],
];
for(const [from,to] of additions){if(code.split(from).length!==2)throw Error('Ambiguous guidance transform: '+from);code=code.replace(from,to);}
code='const OPERATING_GUIDES='+JSON.stringify(guides)+';\n'+helper+'\n'+code;
const out=resolve(process.argv[2]||resolve(root,'dist/worker.mjs'));await mkdir(dirname(out),{recursive:true});await writeFile(out,code);console.log(JSON.stringify({path:out,sha256:sha(code),guides:guides.length,bytes:Buffer.byteLength(code)}));
