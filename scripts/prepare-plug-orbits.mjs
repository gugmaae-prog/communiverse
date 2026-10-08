// Add a scoped wrapper while retaining the current marketplace module exactly.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const [captureArg,destArg]=process.argv.slice(2);if(!captureArg||!destArg)throw Error('Usage: prepare-plug-orbits.mjs <current marketplace capture> <candidate>');
const capture=resolve(captureArg),dest=resolve(destArg),source=resolve(repo,'worker/releases/plug-orbits-20261008');
const manifest=JSON.parse(await readFile(resolve(capture,'manifest.json'),'utf8'));
if(manifest.main_module!=='simple-nav-entry.js')throw Error('Review the current marketplace entry point before assembly');
await mkdir(dest);const moduleMap=new Map();
async function add(name,bytes,content_type){await mkdir(dirname(resolve(dest,name)),{recursive:true});await writeFile(resolve(dest,name),bytes);moduleMap.set(name,{name,bytes:bytes.length,content_type,sha256:createHash('sha256').update(bytes).digest('hex')});}
for(const m of manifest.modules){const bytes=await readFile(resolve(capture,'modules',m.name));if(createHash('sha256').update(bytes).digest('hex')!==m.sha256)throw Error('Capture checksum differs');await add(m.name,bytes,m.content_type);}
for(const [file,name,type] of [['entry.js','plug-orbits-entry.js','application/javascript+module'],['orbits.css','plug-orbits.css','text/plain'],['focus.txt','plug-orbits-focus.txt','text/plain']])await add(name,await readFile(resolve(source,file)),type);
const modules=[...moduleMap.values()];
const retained=modules.filter(m=>manifest.modules.some(old=>old.name===m.name&&old.sha256===m.sha256)).length;
await writeFile(resolve(dest,'manifest.json'),JSON.stringify({...manifest,baselineVersion:manifest.version,release:'20261008-plug-orbits-1',main_module:'plug-orbits-entry.js',originalModulesRetained:retained,modules},null,2));
await writeFile(resolve(dest,'wrangler.jsonc'),JSON.stringify({name:'communiverse-marketplace',main:'plug-orbits-entry.js',compatibility_date:manifest.compatibility_date,compatibility_flags:manifest.compatibility_flags||[],no_bundle:true,find_additional_modules:true,rules:[{type:'ESModule',globs:['**/*.js'],fallthrough:true},{type:'Text',globs:['**/*.txt','**/*.css'],fallthrough:true},{type:'Data',globs:['**/*.mp4'],fallthrough:true}]},null,2));
console.log(JSON.stringify({baseline:manifest.version,preserved:retained,added:modules.length-manifest.modules.length,total:modules.length}));
