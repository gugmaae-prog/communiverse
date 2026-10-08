import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..'),source=resolve(repo,'worker/releases/marketplace-20261008');
const [captureArg,destArg]=process.argv.slice(2);if(!captureArg||!destArg)throw Error('Usage: prepare-marketplace.mjs <capture> <candidate>');
const capture=resolve(captureArg),dest=resolve(destArg),manifest=JSON.parse(await readFile(resolve(capture,'manifest.json'),'utf8'));
if(manifest.main_module!=='plug-orbits-entry.js'||manifest.modules.length!==20)throw Error('Review changed baseline');
await mkdir(dest,{recursive:true});const modules=[];
async function add(name,bytes,type){await writeFile(resolve(dest,name),bytes);modules.push({name,bytes:bytes.length,content_type:type,sha256:createHash('sha256').update(bytes).digest('hex')});}
for(const m of manifest.modules){const bytes=await readFile(resolve(capture,'modules',m.name));if(createHash('sha256').update(bytes).digest('hex')!==m.sha256)throw Error('Baseline checksum mismatch');await add(m.name,bytes,m.content_type)}
for(const [file,name,type] of [['entry.js','market-entry.js','application/javascript+module'],['data.js','market-data.js','application/javascript+module'],['views.js','market-views.js','application/javascript+module'],['members.js','market-members.js','application/javascript+module'],['market.css','market.css','text/plain'],['market.txt','market.txt','text/plain'],['focus.txt','market-focus.txt','text/plain'],['orbits.css','market-orbits.css','text/plain'],['rates.json','market-rates.txt','text/plain']])await add(name,await readFile(resolve(source,file)),type);
const images=(await readdir(resolve(source,'images'))).filter(f=>f.endsWith('.jpg')).sort();let imports='',map='';for(const [i,f] of images.entries()){const name='market-image-'+f;await add(name,await readFile(resolve(source,'images',f)),'application/octet-stream');imports+=`import image${i} from './${name}';\n`;map+=`'/communiverse/_public/20261008-marketplace-1/${f}':image${i},\n`;}
await add('market-images.js',Buffer.from(imports+'export default {\n'+map+'};\n'),'application/javascript+module');
await writeFile(resolve(dest,'manifest.json'),JSON.stringify({...manifest,baselineVersion:manifest.version,baselineBindings:manifest.bindings,bindings:[...manifest.bindings,{name:'EMAIL',type:'send_email',allowed_sender_addresses:['welcome@communiverse.espacios.me']}],release:'20261008-marketplace-1',main_module:'market-entry.js',originalModulesRetained:manifest.modules.length,modules},null,2));
await writeFile(resolve(dest,'wrangler.jsonc'),JSON.stringify({name:'communiverse-marketplace',main:'market-entry.js',compatibility_date:manifest.compatibility_date,compatibility_flags:manifest.compatibility_flags||[],no_bundle:true,find_additional_modules:true,rules:[{type:'ESModule',globs:['**/*.js'],fallthrough:true},{type:'Text',globs:['**/*.txt','**/*.css'],fallthrough:true},{type:'Data',globs:['**/*.mp4','**/*.jpg'],fallthrough:true}]},null,2));
console.log(JSON.stringify({retained:manifest.modules.length,modules:modules.length,images:images.length,totalBytes:modules.reduce((n,m)=>n+m.bytes,0)}));
