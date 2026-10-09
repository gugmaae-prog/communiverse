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
const out=resolve(process.argv[2]||resolve(root,'dist/worker.mjs'));await mkdir(dirname(out),{recursive:true});await writeFile(out,code);console.log(JSON.stringify({path:out,sha256:expected,bytes:Buffer.byteLength(code)}));
