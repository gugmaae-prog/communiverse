// Assemble against a checksum-verified production capture; never use the legacy app build.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const [baselineArg,destinationArg]=process.argv.slice(2);
if(!baselineArg||!destinationArg)throw Error('Usage: node scripts/prepare-plug-haseeb.mjs <production-capture> <candidate>');
const baseline=resolve(baselineArg),dest=resolve(destinationArg);
const manifest=JSON.parse(await readFile(resolve(baseline,'manifest.json'),'utf8'));
const target='members-20261007-entry.js';
if(!manifest.modules.some(m=>m.name===target))throw Error('Expected people module missing');
const replacement=await readFile(resolve(repo,'worker/releases/plug-haseeb-only-20261007/members-entry.js'));
await mkdir(dest);
const modules=[];
for(const m of manifest.modules){
  let bytes=await readFile(resolve(baseline,'modules',m.name));
  if(createHash('sha256').update(bytes).digest('hex')!==m.sha256)throw Error('Baseline checksum mismatch: '+m.name);
  if(m.name===target)bytes=replacement;
  await mkdir(dirname(resolve(dest,m.name)),{recursive:true});
  await writeFile(resolve(dest,m.name),bytes);
  modules.push({...m,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await writeFile(resolve(dest,'manifest.json'),JSON.stringify({...manifest,release:'20261007-plug-haseeb-only-1',baselineVersion:manifest.version,modules},null,2));
await writeFile(resolve(dest,'wrangler.jsonc'),JSON.stringify({name:'communiverse',main:manifest.main_module,compatibility_date:manifest.compatibility_date,compatibility_flags:manifest.compatibility_flags||[],no_bundle:true,find_additional_modules:true,rules:[{type:'ESModule',globs:['**/*.js'],fallthrough:true},{type:'Text',globs:['**/*.txt','**/*.css','**/*.html'],fallthrough:true},{type:'Data',globs:['**/*.jpg','**/*.png','**/*.mp4','**/*.webp'],fallthrough:true}]},null,2));
console.log(JSON.stringify({baseline:manifest.version,totalModules:modules.length,changedModules:modules.filter(m=>m.sha256!==manifest.modules.find(o=>o.name===m.name).sha256).map(m=>m.name)}));
