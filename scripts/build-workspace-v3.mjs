/* Build only the retained workspace gateway modules; no legacy site replacement. */
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(process.argv[2]||resolve(root,'work/workspace-v3-build'));
const source=resolve(root,'worker/experience-v3');
await mkdir(out,{recursive:true});
for(const [name,files] of [['gateway.mjs',['production-gateway.mjs']],['v3-client.txt',['goal-planner.js','experience-v3.js']],['v3-style.txt',['experience-v3.css','goal-planner.css']]]){
 const parts=await Promise.all(files.map(f=>readFile(resolve(source,f))));
 if(name==='v3-client.txt'){const guides=JSON.parse(await readFile(resolve(root,'worker/design-system/operating-guides.json'),'utf8'));parts.unshift(Buffer.from('window.__cvOperatingGuides='+JSON.stringify(guides)+';\n'));}
 await writeFile(resolve(out,name),Buffer.concat(parts.flatMap((p,i)=>i?[Buffer.from('\n'),p]:[p])));
}
console.log('Built workspace gateway, client and styles.');
