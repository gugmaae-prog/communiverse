// Local assembly only. Retain every recovered production module and binding.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [baselineArg, destinationArg] = process.argv.slice(2);
if (!baselineArg || !destinationArg) throw Error('Usage: node scripts/prepare-gallery-media.mjs <recovered-production> <new-candidate-directory>');
const baseline = resolve(baselineArg), destination = resolve(destinationArg);
const manifest = JSON.parse(await readFile(resolve(baseline, 'manifest.json'), 'utf8'));
const release = '20261007-gallery-media-1';
const items = JSON.parse(await readFile(resolve(repository, 'worker/releases/gallery-media-20261007/media.json'), 'utf8'));
await mkdir(destination); // Do not silently overwrite another candidate.
for (const module of manifest.modules) {
  const bytes = await readFile(resolve(baseline, 'modules', module.name));
  if (createHash('sha256').update(bytes).digest('hex') !== module.sha256) throw Error('Baseline checksum mismatch: ' + module.name);
  const path = resolve(destination, module.name);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
}
const modules = [...manifest.modules];
async function add(name, bytes, content_type) {
  await mkdir(dirname(resolve(destination, name)), { recursive: true });
  await writeFile(resolve(destination, name), bytes);
  modules.push({ name, content_type, bytes: Buffer.byteLength(bytes), sha256: createHash('sha256').update(bytes).digest('hex') });
}
let script = await readFile(resolve(baseline, 'modules/rigid-script.txt'), 'utf8');
const anchor = 'const lite=()=>navigator.connection?.saveData===true;';
if (script.split(anchor).length !== 2 || script.includes('20261007-gallery-media-1')) throw Error('Gallery baseline changed; review before patching');
script = script.replace(anchor, `/* User-supplied clips: ${release}. */\nextra.push(...${JSON.stringify(items, null, 2)});\n\n${anchor}`);
await add('gallery-media-script.txt', script, 'text/plain');
await add('retained-production.js', `export {default} from './${manifest.main_module}';\n`, 'application/javascript+module');
let imports = '', entries = '';
for (const [i, item] of items.entries()) {
  for (const [j, url] of [item.src, item.poster].entries()) {
    const name = url.split('/').pop(), variable = `media${i}_${j}`;
    imports += `import ${variable} from './gallery-media/${name}';\n`;
    entries += `  '${url}': [${variable}, '${j ? 'image/jpeg' : 'video/mp4'}'],\n`;
    await add('gallery-media/' + name, await readFile(resolve(repository, 'public/media/gallery-20261007', name)), 'application/octet-stream');
  }
}
const template = await readFile(resolve(repository, 'worker/releases/gallery-media-20261007/entry.template.js'), 'utf8');
await add('gallery-media-entry.js', template.replace('/* MEDIA_IMPORTS */', imports).replace('/* MEDIA_ENTRIES */', entries), 'application/javascript+module');
await writeFile(resolve(destination, 'manifest.json'), JSON.stringify({ ...manifest, release, baselineVersion: manifest.version, main_module: 'gallery-media-entry.js', modules }, null, 2));
await writeFile(resolve(destination, 'wrangler.jsonc'), JSON.stringify({name:'communiverse',main:'gallery-media-entry.js',compatibility_date:manifest.compatibility_date,compatibility_flags:manifest.compatibility_flags||[],no_bundle:true,find_additional_modules:true,rules:[{type:'ESModule',globs:['**/*.js'],fallthrough:true},{type:'Text',globs:['**/*.txt','**/*.css','**/*.html'],fallthrough:true},{type:'Data',globs:['**/*.jpg','**/*.png','**/*.mp4','**/*.webp'],fallthrough:true}]},null,2));
console.log(JSON.stringify({ release, baselineVersion:manifest.version, retainedModules:manifest.modules.length, newModules:modules.length-manifest.modules.length, clips:items.length }));
