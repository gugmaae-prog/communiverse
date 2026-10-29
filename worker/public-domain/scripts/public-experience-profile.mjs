import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function publicExperienceModules(){
 const root=execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim(),prefix='worker/public-domain/public-domain/';
 const reviewed=JSON.parse(await fs.readFile('manifests/public-experience-source.json')),sourceRef=reviewed.sourceRef;try{execFileSync('git',['cat-file','-e',sourceRef+'^{commit}'],{stdio:'ignore'});}catch{assert.equal(process.env.CI,'true','Fetch the pinned reconciliation commit before building');execFileSync('git',['fetch','--no-tags','--depth=1','origin',sourceRef],{stdio:'pipe'});}
 const names=execFileSync('git',['-C',root,'ls-tree','-r','--name-only',sourceRef,'--',prefix],{encoding:'utf8'}).trim().split('\n');
 const manifests=JSON.parse(await fs.readFile('manifests/retained-modules.json'));
 const current=execFileSync('git',['ls-files','-z','public-domain'],{encoding:'utf8'}).split('\0').filter(Boolean),modules=[];
 for(const file of current){const name=file.slice('public-domain/'.length),bytes=await fs.readFile(file);modules.push({name,bytes});}
 const boundaries=[];
 for(const file of names){const name=file.slice(prefix.length);if(name.startsWith('retained/')){const present=modules.find(m=>m.name===name);assert(present&&sha(present.bytes)===manifests.find(m=>m.name===name.slice(9)).sha256);continue;}
  const original=execFileSync('git',['-C',root,'show',sourceRef+':'+file],{maxBuffer:20*1024*1024});
  let bytes=['public-fallback.mjs','registration-delivery.mjs'].includes(name)?await fs.readFile('public-domain/'+name):original;
  if(reviewed.patches[name])assert.equal(sha(bytes),reviewed.patches[name],'Review changed live-runtime patch '+name);
  if(name.endsWith('.mjs'))bytes=Buffer.from(bytes.toString().replace(/(['"])\.\/retained\//g,'$1../retained/'));
  modules.push({name:'stable/'+name,bytes});boundaries.push({name,source:sha(original),runtime:sha(bytes),currentPatch:['public-fallback.mjs','registration-delivery.mjs'].includes(name)});
 }
 const entry=modules.find(m=>m.name==='public-experience-entry.mjs');assert(entry);modules.push({name:'public-release.mjs',bytes:entry.bytes});
 return {modules,sourceRef,boundaries};
}
export async function materializePublicExperience(directory){const result=await publicExperienceModules();for(const m of result.modules){const file=path.join(directory,m.name);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,m.bytes);}return result;}
