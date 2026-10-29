import fs from 'node:fs/promises';import path from 'node:path';import {build} from './runtime.mjs';
const manifest=JSON.parse(await fs.readFile('manifests/retained-modules.json')),texts=new Set(manifest.filter(m=>m.type.startsWith('text/')).map(m=>path.resolve('public-domain/retained',m.name)));
await fs.mkdir('dist',{recursive:true});await build({entryPoints:['public-domain/entry.mjs'],bundle:true,outfile:'dist/worker.mjs',format:'esm',target:'es2022',platform:'browser',logLevel:'error',external:['node:*','cloudflare:*'],loader:{'.txt':'text','.css':'text','.html':'text','.jpg':'binary','.mp4':'binary','.png':'binary','.webp':'binary'},plugins:[{name:'retained-module-types',setup(b){b.onLoad({filter:/.*/},async a=>texts.has(a.path)?{contents:await fs.readFile(a.path,'utf8'),loader:'text'}:undefined)}}]});console.log('Built Communiverse public Worker.');

await import('./build-public-experience.mjs');
